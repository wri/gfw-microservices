
/**
 * importCsvToMssql.ts
 */

import * as fs from 'fs';
import Papa from 'papaparse';
import * as sql from 'mssql';
import { SQL_CONFIG } from './libs/sql/src/lib/config/config';
// import * as dotenv from 'dotenv';

// dotenv.config(); // Load environment variables from .env file

// console.log(process.env);

interface RawPalmUMLCsvRow {
  OBJECTID: string;
  Join_Count: string;
  TARGET_FID: string;
  gfw_fid: string;
  uml_id: string;
  group_name: string;
  parent_com: string;
  mill_name: string;
  rspo_statu: string;
  rspo_type: string;
  date_rspo_: string;
  latitude: string;
  longitude: string;
  gps_coordi: string;
  iso: string;
  country: string;
  province: string;
  district: string;
  confidence: string;
  alternativ: string;
  gfw_area__: string;
  gfw_geosto: string;
  iso_1: string;
  name_0: string;
  id_1: string;
  name_1: string;
  id_2: string;
  name_2: string;
  id_0: string;
  name_all: string;
  gadmid: string;
  Shape_Leng: string;
}

const sqlConfig = SQL_CONFIG as sql.config;

/**
 * parseFile: Reads a CSV file from disk using Papa.parse
 * and resolves with an array of RawPalmUMLCsvRow objects (header-based).
 */
async function parseFile(filePath: string): Promise<RawPalmUMLCsvRow[]> {
  const csvData = fs.readFileSync(filePath, 'utf8');

  return new Promise<RawPalmUMLCsvRow[]>((resolve, reject) => {
    Papa.parse<RawPalmUMLCsvRow>(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          return reject(results.errors);
        }

        resolve(results.data);
      }
    });
  });
}

/**
 * A helper function to parse latitude/longitude out of a "lat,long" string.
 * Expects something like "3.456,101.234".
 * Returns [lat, lon].
 */
function parseCoordinates(gpsCoordi: string): [number, number] {
  const [latStr, longStr] = gpsCoordi.split(',').map(s => s.trim());
  return [parseFloat(latStr), parseFloat(longStr)];
}
/**
 * transformCsvRow: Takes one CSV row (RawPalmUMLCsvRow) and returns 
 * the final data shape (PalmOilMillsRow) to match [dbo].[list-palmOilMills].
 *
 * This is where you do your mapping & transformations, which is easy to change 
 * if columns or logic differ for other CSV formats.
 */
interface ProcessedPalmOilMillsRow {
  locationName: string;           // [Location Name]
  analysisRadius: number;         // [Analysis Radius]
  size: number;                   // [Size]
  parentCompany: string;          // [Parent Company]
  companyId: string;              // [Company ID]
  certification: string;          // [Certification]
  rspoModel: string;              // [RSPO Model]
  latitude: number;               // [Latitude]
  longitude: number;              // [Longitude]
  locationClassification: string; // [Location Classification]
  commodity: string;              // [Commodity]
  country: string;                // [Country]
  state: string;                  // [State]
  subState: string;               // [Sub State]
  gadmid: string;                 // [gadmid]
  groupName: string;              // [Group Name]
  millId: string;                 // [Mill ID]
  alternativeName: string;        // [Alternative Name]
  geometryWkt: string;            // WKT for [Geometry]
  geometrySimplifiedWkt: string;  // WKT for [Geometry Simplified]
  globalid: string;               // [globalid]
  locationId: number;             // [location_id]
  id: number;                     // [id]
}
function transformCsvRow(raw: RawPalmUMLCsvRow): ProcessedPalmOilMillsRow {
  const [latitude, longitude] = parseCoordinates(raw.gps_coordi);

  // Determine certification logic based on 'rspo_type'
  let certification = 'None';
  if (raw.rspo_type.toLowerCase().includes('rspo certified')) {
    certification = 'RSPO';
  }

  // We'll store geometry as WKT. We can convert to geometry in the SQL INSERT.
  const geometryWkt = `POINT(${longitude} ${latitude})`;

  // Return the final mapped + transformed object
  return {
    locationName: raw.mill_name,    // [Location Name]
    analysisRadius: 50.0,          // [Analysis Radius] = fixed
    size: 785398.163,              // [Size] = fixed
    parentCompany: raw.parent_com,  // [Parent Company]
    companyId: 'n/a',               // [Company ID] = fixed
    certification,                  // [Certification] => 'RSPO' or 'None'
    rspoModel: raw.rspo_type,       // [RSPO Model]
    latitude,
    longitude,
    locationClassification: 'Supply Shed', // [Location Classification] = fixed
    commodity: 'Palm Oil',                // [Commodity] = fixed
    country: raw.name_0,                  // [Country]
    state: raw.name_1,                    // [State]
    subState: raw.name_1,                 // [Sub State]
    gadmid: raw.gadmid,                   // [gadmid]
    groupName: raw.group_name,            // [Group Name]
    millId: raw.uml_id,                   // [Mill ID]
    alternativeName: '',                  // [Alternative Name] = fixed
    geometryWkt,
    geometrySimplifiedWkt: geometryWkt,   // same geometry
    globalid: raw.gfw_geosto,             // [globalid]
    locationId: parseInt(raw.OBJECTID, 10), // [location_id]
    id: parseInt(raw.OBJECTID, 10)          // [id]
  };
}

/**
 * saveToDB: Receives an array of CSV rows, transforms each to 
 * the final table shape, and inserts into SQL Server.
 */
async function saveToDB(rows: RawPalmUMLCsvRow[]): Promise<void> {
  console.log("🚀 ~ saveToDB ~ rows:", rows);
  
  const pool = new sql.ConnectionPool(sqlConfig);
  await pool.connect();

  debugger;

  console.log(`Inserting ${rows.length} rows into [dbo].[list-palmOilMills_new]...`);

  // We'll prepare the insert statement once and reuse it.  
  const insertStmt = `
    INSERT INTO [dbo].[list-palmOilMills_new]
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
    const rowData = transformCsvRow(rawRow);

    try {
      await pool.request()
        .input('locationName', sql.NVarChar(150), rowData.locationName)
        .input('analysisRadius', sql.Decimal(18, 6), rowData.analysisRadius)
        .input('size', sql.Decimal(18, 6), rowData.size)
        .input('parentCompany', sql.NVarChar(150), rowData.parentCompany)
        .input('companyId', sql.NVarChar(150), rowData.companyId)
        .input('certification', sql.NVarChar(150), rowData.certification)
        .input('rspoModel', sql.NVarChar(150), rowData.rspoModel)
        .input('latitude', sql.Float, rowData.latitude)
        .input('longitude', sql.Float, rowData.longitude)
        .input('locationClassification', sql.NVarChar(150), rowData.locationClassification)
        .input('commodity', sql.NVarChar(150), rowData.commodity)
        .input('country', sql.NVarChar(150), rowData.country)
        .input('state', sql.NVarChar(150), rowData.state)
        .input('subState', sql.NVarChar(150), rowData.subState)
        .input('gadmid', sql.NVarChar(50), rowData.gadmid)
        .input('groupName', sql.NVarChar(150), rowData.groupName)
        .input('millId', sql.NVarChar(150), rowData.millId)
        .input('alternativeName', sql.NVarChar(150), rowData.alternativeName)
        .input('geometryWkt', sql.NVarChar(sql.MAX), rowData.geometryWkt)
        .input('geometrySimplifiedWkt', sql.NVarChar(sql.MAX), rowData.geometrySimplifiedWkt)
        .input('globalid', sql.NVarChar(150), rowData.globalid)
        .input('locationId', sql.Int, rowData.locationId)
        .input('id', sql.Int, rowData.id)
        .query(insertStmt);

      insertedCount++;
      if (insertedCount % 500 === 0) {
        console.log(`Inserted ${insertedCount} rows...`);
      }

    } catch (err) {
      console.error(`Failed to insert row (OBJECTID=${rawRow.OBJECTID}):`, err);
    }
  }

  console.log(`All done. Inserted ${insertedCount} rows.`);
  await pool.close();
}

/**
 * A main function to tie it together:
 *  1) Parse the CSV file
 *  2) Save contents to DB
 */
async function main() {
  const csvPath = 'gfw_universal_mill_joined_gadm_gridded_final.csv';
  console.log("🚀 ~ main ~ csvPath:", csvPath)
  
  try {
    const csvContents = await parseFile(csvPath);
    await saveToDB(csvContents);
  } catch (error) {
    console.error('Error during import:', error.stack || error);
    throw error;
  }
}

main();