import { EntitySchema, QueryRunner } from 'typeorm';
import { Logger } from '@nestjs/common';
import { ListAttributes, Lists, ListSchema, ListSchemaType, ListTemplate } from '../entity';
import { ClientStoreConnection, SQLUtils } from '../util';
import { COMMODITY_MAP_SPAM, MAPSPAM_COMMODITY, GHG_PREFIX, MAPSPAM_CODES } from './comMapSpam';

export function inferType(value: unknown): string {
  return typeof value === 'number' ? 'number' : 'string';
}
export enum ListsAttrsTypes {
  Number = 1,
  Text = 2,
}
export function getFormattedAttributes({
  listId,
  attributeField,
  fieldValue,
}): ListAttributesRecord {
  return {
    list_id: listId,
    attribute_name: attributeField,
    attribute_type:
      inferType(fieldValue) === 'number' ? ListsAttrsTypes.Number : ListsAttrsTypes.Text,
  };
}
export function getListsLocsColumnsToExclude() {
  const { options } = new EntitySchema<ListSchemaType>({
    ...ListSchema,
  });

  const allKeys = Object.keys(options.columns).map((keyAcc) => {
    // exclude both human and camelCase names
    return [options.columns[keyAcc].name, keyAcc];
  });

  return allKeys.flat();
}

export interface ListAttributesRecord {
  list_id: number;
  attribute_name: string;
  attribute_type: number;
}
export async function saveListAttributes(
  queryRunner: QueryRunner,
  attributes: ListAttributesRecord[]
) {
  try {
    // insert new attributes with Typeorm listAttributes entity
    const listAttributesRepository = queryRunner.manager.getRepository(ListAttributes);

    Logger.log(`Inserting ${attributes.length} into [ListAttributes]`);

    await listAttributesRepository.save(attributes);
  } catch (error) {
    // throwing errors for PrimaryKey constraints is likely more efficient than checking the db if they exists, less roundtrips
    if (error?.message.includes('Violation of PRIMARY KEY constraint')) {
      Logger.log(`Constraint violation handled for `, error.stack || error);
    } else {
      Logger.error(`Something went wrong executing query.`, error.stack || error);
      throw error;
    }
  }
}

export async function getListAttributes(clientDb, listId: number) {
  try {
    // insert new attributes with Typeorm listAttributes entity
    const clientStore = new ClientStoreConnection();
    const connection = await clientStore.getConnection(clientDb);
    const listAttributesRepository = connection.getRepository(ListAttributes);

    const listAttributes = await listAttributesRepository.find({
      where: {
        list_id: listId,
      },
    });

    return listAttributes;
  } catch (error) {
    // throwing errors for PrimaryKey constraints is likely more efficient than checking the db if they exists, less roundtrips
    if (error?.message.includes('Violation of PRIMARY KEY constraint')) {
      Logger.log(`Constraint violation handled for `, error.stack || error);
    } else {
      Logger.error(`Something went wrong executing query.`, error.stack || error);
      throw error;
    }
  }
}

export async function getTemplateName(listTemplateId: number) {
  const clientStoreConnection = new ClientStoreConnection();
  const connection = await clientStoreConnection.getConnection('gfwpro');
  const templatesRepository = connection.getRepository(ListTemplate);

  const templateData = await templatesRepository.findOne({
    where: { id: listTemplateId },
  });
  return templateData.templateName;
}

function searchCommodityCodeFromTerm(searchTerm: string) {
  return getGHGCodesMap().find(
    (code) =>
      code.commodities.includes(searchTerm?.toLowerCase()) ||
      code.label?.toLowerCase() === searchTerm?.toLowerCase() ||
      code.value?.toLowerCase() === searchTerm?.toLowerCase()
  );
}

export function getCommodityCodeFromTemplate(templateName: string, userListCommodity: string) {
  /**
   * If version=1 and template_id=1 (investment), then we store GFWP_Multiple as the Lists.Commodity.
   * @see {@link https://gfw.atlassian.net/browse/GPV-4086?focusedCommentId=38187}
   */
  if (templateName === 'Investment') {
    return `${GHG_PREFIX}_Multiple`;
  }

  const templateSearch = searchCommodityCodeFromTerm(templateName);
  const userSearch = searchCommodityCodeFromTerm(userListCommodity);

  if (templateSearch) {
    return templateSearch.value;
  } else if (userSearch) {
    return userSearch.value;
  } else if (userListCommodity) {
    return `${GHG_PREFIX}_${userListCommodity}`;
  } else if (['Cattle Ranch', 'Cattle Generic', 'Beef Slaughterhouse'].includes(templateName)) {
    return `${GHG_PREFIX}_Cattle`;
  } else {
    return `${GHG_PREFIX}_Unknown`;
  }
}

type GHGCodeMapping = {
  value: string;
  label: string;
  commodities: string[];
};
function getGHGCodesMap(): GHGCodeMapping[] {
  type MAPSPAMCodeValues = (typeof MAPSPAM_CODES)[keyof typeof MAPSPAM_CODES];
  const codeMap: { [key in MAPSPAMCodeValues]?: string[] } = {};

  // group commodities by their GHG code
  Object.entries(COMMODITY_MAP_SPAM).forEach(([commodity, code]) => {
    if (!codeMap[code]) {
      codeMap[code] = [];
    }
    codeMap[code]?.push(commodity);
  });

  return Object.keys(codeMap).map((code: keyof typeof MAPSPAM_CODES) => ({
    value: code,
    label: MAPSPAM_COMMODITY[code],
    commodities: codeMap[code] || [],
  }));
}
export async function getListsAttributes(clientDatabase: string, findOptions) {
  try {
    const clientStoreConnection = new ClientStoreConnection();
    const connection = await clientStoreConnection.getConnection(clientDatabase);
    const listAttributesRepository = connection.getRepository(ListAttributes);

    return await listAttributesRepository.find(findOptions);
  } catch (error) {
    Logger.warn(`getListsAttributes`, error.stack || error);
    return [];
  }
}
export async function getListJsonAttributesColumnsSqlParam(clientDatabase: string, listId: number) {
  const listAttributesRecords = await getListsAttributes(clientDatabase, {
    where: {
      list_id: listId,
    },
  });

  const castStringArr = listAttributesRecords.map((attrRecord) => {
    const fieldTypeCast =
      attrRecord.attribute_type === ListsAttrsTypes.Number ? 'DECIMAL(18, 6)' : 'NVARCHAR(MAX)';
    return `CAST(JSON_VALUE(lt.attributes, '$."${attrRecord.attribute_name}"') AS ${fieldTypeCast}) AS [${attrRecord.attribute_name}]`;
  });

  return castStringArr.join(',');
}

export async function getListLocationsColumnsToDelete(
  clientDb: string,
  tableName: string,
  columnsToExclude: string[]
): Promise<string[]> {
  const excludeClause = columnsToExclude.map((colName) => `'${colName}'`).join(',');

  const sql = `
    SELECT c.name as colName
    FROM sys.columns c
    JOIN sys.objects o ON c.object_id = o.object_id
    WHERE 
      o.name = '${tableName}'
      AND c.name NOT IN (${excludeClause})
  `;
  const rows = await SQLUtils.queryDB<{ colName: string }[]>(clientDb, sql);

  return rows.map((row) => row.colName);
}
/**
 * – Get all locations from the DB
 * – Traverse and get all list-xxxx.attributes that are not included in list.schema
 * – Update the same list-xxxx table with a json string, format: {"column": "value"}
 * – grab the list-xxxx attributes object
 * – save the object inside the attributes column as a json string
 * – save valid list attributes into [ListAttributes] by checking if they exists first
 * @param clientDb
 * @param list
 * @param columnsToExclude
 * @returns listLocations[]
 */
export async function handleListLocationAttributes(
  queryRunner: QueryRunner,
  list: Lists,
  columnsToExclude: unknown[]
) {
  const listLocations = await queryRunner.query(`SELECT * FROM [${list.listTableName}]`);
  Logger.log(`List Locations found: ${listLocations.length}`);

  if (listLocations.length) {
    for (let index = 0; index < listLocations.length; index++) {
      const record = listLocations[index];

      const validListAttrs = Object.keys(record).filter((col) => !columnsToExclude.includes(col));

      const locAttrObj = validListAttrs.reduce((acc, key) => {
        if (record[key] === null) {
          return acc;
        }
        acc[key] = `${record[key]}`;
        return acc;
      }, {} as Record<string, unknown>);

      const attrValue = Object.keys(locAttrObj).length ? `'${JSON.stringify(locAttrObj)}'` : 'NULL';

      const updateQuery = `UPDATE [${list.listTableName}] 
        SET [attributes] = {ATTR_VALUE}  
        WHERE [location_id] = ${record['location_id']}`.replace('{ATTR_VALUE}', attrValue);

      await queryRunner.query(updateQuery);

      const listAttrsToSave = validListAttrs.map((attributeField) =>
        getFormattedAttributes({
          listId: list.id,
          attributeField,
          fieldValue: record[attributeField],
        })
      );

      await saveListAttributes(queryRunner, listAttrsToSave);
    }
  }
  return listLocations;
}

export async function setListLocationNameIfIsInvestment(
  queryRunner: QueryRunner,
  listTableName: string
) {
  const sqlCmd = `
  DECLARE @tbl sysname = QUOTENAME('${listTableName}');

  IF COL_LENGTH('dbo.' + @tbl, 'Location Name') IS NULL
     AND COL_LENGTH('dbo.' + @tbl, 'Investment Name') IS NOT NULL
  BEGIN
    DECLARE @sql NVARCHAR(MAX);

    SET @sql = 'ALTER TABLE dbo.' + @tbl + ' ADD [Location Name] NVARCHAR(MAX);';
    EXEC sp_executesql @sql;

    SET @sql = 'UPDATE dbo.' + @tbl + ' SET [Location Name] = [Investment Name];';
    EXEC sp_executesql @sql;
  END`;
  await queryRunner.query(sqlCmd);
}
