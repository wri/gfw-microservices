import * as XLSX from 'xlsx';
import * as sql from 'mssql';
import * as path from 'path';

const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/** ****************************************************************************
 * npx ts-node ./import_xsl_to_mssql.ts
 ******************************************************************************/

interface RawPalmUMLXlsRow {
  uml_id: string;
  gfw_fid: string;
  group_name: string;
  parent_com: string;
  mill_name: string;
  rspo_type: string;
  country: string;
  province: string;
  latitude: string;
  longitude: string;
  district: string;
  alternativ: string;
  gfw_geosto: string;
  gadmid: string;
}

const SQL_CONFIG = {
  user: process.env.MSSQL_USERNAME,
  password: process.env.MSSQL_PASSWORD,
  database: process.env.MSSQL_DATABASE,
  server: process.env.MSSQL_HOSTNAME,
  port: parseInt(process.env.MSSQL_PORT || ''),
  options: {
    trustServerCertificate: true,
  },
  requestTimeout: 600000,
} as sql.config;

/**
 * parseFile: Reads a XLS file from disk using Papa.parse
 * and resolves with an array of RawPalmUMLXlsRow objects (header-based).
 */
async function parseFile(filePath: string): Promise<RawPalmUMLXlsRow[]> {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // take the first sheet
  const sheet = workbook.Sheets[sheetName];

  const rows: RawPalmUMLXlsRow[] = XLSX.utils.sheet_to_json(sheet, {
    defval: '', // default empty cells to ''
  }) as RawPalmUMLXlsRow[];

  return rows;
}

/**
 * transformXlsRow: Takes one XLs row (RawPalmUMLXlsRow) and returns
 * the final data shape (PalmOilMillsRow) to match [dbo].[list-palmOilMills].
 *
 * This is where you do your mapping & transformations, which is easy to change
 * if columns or logic differ for other XLs formats.
 */
interface ProcessedPalmOilMillsRow {
  locationName: string;
  analysisRadius: number;
  size: number;
  parentCompany: string;
  companyId: string;
  certification: string;
  rspoModel: string;
  latitude: number;
  longitude: number;
  locationClassification: string;
  commodity: string;
  country: string;
  state: string;
  subState: string;
  gadmid: string;
  groupName: string;
  millId: string;
  alternativeName: string;
  geometryWkt: string; // WKT for [Geometry]
  geometrySimplifiedWkt: string; // WKT for [Geometry Simplified]
  globalid: string;
  locationId: number;
  id: number;
}
function transformXlsRow({
  mill_name: locationName,
  longitude,
  latitude,
  parent_com,
  rspo_type,
  country,
  province,
  district,
  alternativ,
  gfw_geosto,
  gadmid,
  group_name,
  uml_id,
  gfw_fid,
}: RawPalmUMLXlsRow): ProcessedPalmOilMillsRow {
  // Determine certification logic based on 'rspo_type'
  let certification = 'None';
  if (rspo_type.toLowerCase().includes('rspo certified')) {
    certification = 'RSPO';
  }

  // We'll store geometry as WKT. We can convert to geometry in the SQL INSERT.
  const geometryWkt = `POINT(${longitude} ${latitude})`;

  // Return the final mapped + transformed object
  return {
    locationName,
    analysisRadius: 50.0,
    size: 785398.163,
    parentCompany: parent_com,
    companyId: 'n/a',
    certification,
    rspoModel: rspo_type,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    locationClassification: 'Supply Shed',
    commodity: 'Palm Oil',
    country: country,
    state: province,
    subState: district,
    gadmid: gadmid,
    groupName: group_name,
    alternativeName: alternativ || '',
    geometryWkt,
    geometrySimplifiedWkt: geometryWkt,
    globalid: gfw_geosto,
    millId: uml_id,
    locationId: parseInt(gfw_fid, 10),
    id: parseInt(gfw_fid, 10),
  };
}

/**
 * saveToDB: Receives an array of XSL rows, transforms each to
 * the final table shape, and inserts into SQL Server.
 */
async function saveToDB(rows: RawPalmUMLXlsRow[]): Promise<void> {
  const pool = new sql.ConnectionPool(SQL_CONFIG);
  await pool.connect();

  await pool.request().query('DELETE FROM [dbo].[list-palmOilMills_import]');
  console.log('Cleared existing rows from [dbo].[list-palmOilMills_import]');

  console.log(`Inserting ${rows.length} rows into [dbo].[list-palmOilMills_import]...`);

  // We'll prepare the insert statement once and reuse it.
  const insertStmt = `
    INSERT INTO [dbo].[list-palmOilMills_import]
    (
      [Location Name],
      [Analysis Radius],
      [Size],
      [Parent Company],
      [Company ID],
      [Certification],
      [RSPO Model],
      [Latitude],
      [Longitude],
      [Location Classification],
      [Commodity],
      [Country],
      [State],
      [Sub State],
      [gadmid],
      [Group Name],
      [Mill ID],
      [Alternative Name],
      [Geometry],
      [Geometry Simplified],
      [globalid],
      [location_id],
      [id]
    )
    VALUES (
      @locationName,
      @analysisRadius,
      @size,
      @parentCompany,
      @companyId,
      @certification,
      @rspoModel,
      @latitude,
      @longitude,
      @locationClassification,
      @commodity,
      @country,
      @state,
      @subState,
      @gadmid,
      @groupName,
      @millId,
      @alternativeName,
      geometry::STPointFromText(@geometryWkt, 4326),
      geometry::STPointFromText(@geometrySimplifiedWkt, 4326),
      @globalid,
      @locationId,
      @id
    )
  `;

  let insertedCount = 0;

  // For ±2.2k rows, looping is probably fine.
  // (For bigger volumes, consider Bulk Insert or batched inserts.)
  for (const rawRow of rows) {
    const {
      locationName,
      analysisRadius,
      size,
      parentCompany,
      companyId,
      certification,
      rspoModel,
      latitude,
      longitude,
      locationClassification,
      commodity,
      country,
      state,
      subState,
      gadmid,
      groupName,
      millId,
      alternativeName,
      geometryWkt,
      geometrySimplifiedWkt,
      globalid,
      locationId,
      id,
    } = transformXlsRow(rawRow);

    try {
      await pool
        .request()
        .input('locationName', sql.NVarChar(150), locationName)
        .input('analysisRadius', sql.Decimal(18, 6), analysisRadius)
        .input('size', sql.Decimal(18, 6), size)
        .input('parentCompany', sql.NVarChar(150), parentCompany)
        .input('companyId', sql.NVarChar(150), companyId)
        .input('certification', sql.NVarChar(150), certification)
        .input('rspoModel', sql.NVarChar(150), rspoModel)
        .input('latitude', sql.Float, latitude)
        .input('longitude', sql.Float, longitude)
        .input('locationClassification', sql.NVarChar(150), locationClassification)
        .input('commodity', sql.NVarChar(150), commodity)
        .input('country', sql.NVarChar(150), country)
        .input('state', sql.NVarChar(150), state)
        .input('subState', sql.NVarChar(150), subState)
        .input('gadmid', sql.NVarChar(50), gadmid)
        .input('groupName', sql.NVarChar(150), groupName)
        .input('millId', sql.NVarChar(150), millId)
        .input('alternativeName', sql.NVarChar(150), alternativeName)
        .input('geometryWkt', sql.NVarChar(sql.MAX), geometryWkt)
        .input('geometrySimplifiedWkt', sql.NVarChar(sql.MAX), geometrySimplifiedWkt)
        .input('globalid', sql.NVarChar(150), globalid)
        .input('locationId', sql.Int, locationId)
        .input('id', sql.Int, id)
        .query(insertStmt);

      insertedCount++;
      if (insertedCount % 500 === 0) {
        console.log(`Inserted ${insertedCount} rows...`);
      }
    } catch (err) {
      console.error(`Failed to insert row (OBJECTID=${id}):`, err);
    }
  }

  console.log(`All done. Inserted ${insertedCount} rows.`);
  await pool.close();
}

/**
 * A main function to tie it together:
 *  1) Parse the XLS file
 *  2) Save contents to DB
 */
async function main() {
  const excelPath = 'gfw_universal_mill.xls';
  console.log('🚀 ~ main ~ excelPath:', excelPath);

  try {
    const fileContents = await parseFile(excelPath);
    await saveToDB(fileContents);
  } catch (error: any) {
    console.error('Error during import:', error.stack || error);
    throw error;
  }
}

main();
