/**
 * @summary update list schema from version 1 to 2
 * 1 - Write Lists.Commodity based on Lists.template_id for given list_id
 * 2 - Write list-xxx.attributes based on other list-xxx columns
 * 3 - Update Lists.version=2 for given list_id
 * –––––––––––––––––––––––––––––––––––––––
 * @notes for the [Commodity] column values:
 * — Multiple is not supported in v1
 * — Other is stored as GFWP_Other
 * — Commodity=GFWP_Unknown is not supported
 * — API default when uploading lists will be Commodity=Unknown unless user specifies otherwise
 * — DB internally will store 4 letter Mapspam codes, but both input and output CSVs will require full English names
 * — @note
 *    For commodities in the Pro UI that are not in MapSPAM,
 *    we’ll create special values with GFWP_ prefix.
 *    These will not result in GHG analysis.
 * –––––––––––––––––––––––––––––––––––––––
 * @param clientDb string
 * @param listId number
 * @param userId number
 */
import { Logger } from '@nestjs/common';
import { ClientStoreConnection, SQLUtils } from '../util';
import { UspSetListUnlocked } from './uspSetListUnlocked';
import { UspSetListLocked } from './uspSetListLocked';
import { ListAttributes, Lists, ListSchema, ListSchemaType } from '../entity';
import { getAllLists, ListsType, TemplateMetadata } from '../queries';
import { EntitySchema } from 'typeorm';
import * as sql from 'mssql';

const LIST_VERSION_POST_UPGRADE = 2;

interface SchemaUpgraderArgs {
  clientDb: string;
  listId: number;
  userId: number;
}
export async function upgradeListSchema(args: SchemaUpgraderArgs) {
  const { clientDb, listId, userId } = args;
  const logger = new Logger(`SchemaUpgrade for ListId: ${listId}`);
  try {
    const listsQuery = getAllLists.replace(
      'ORDER BY list_name',
      `WHERE L.[id] = ${listId} ORDER BY L.list_name`
    );
    const list = await SQLUtils.queryDBFirstRow<ListsType>(clientDb, listsQuery);

    if (list.version !== LIST_VERSION_POST_UPGRADE) {
      logger.log(`Locking list`);
      await new UspSetListLocked().run(clientDb, list.id, userId);

      /**
       * @step 1
       * Write Lists.Commodity based on Lists.template_id for given list_id
       * see {@link https://gfw.atlassian.net/browse/GPV-3983}
       */
      const templateName = await getTemplateName(list.template_id);
      const listCommmodity = await getCommodityCodeFromTemplate(templateName);

      logger.log(`Writing list.[Commodity] = ${listCommmodity} from template: ${templateName}`);
      await SQLUtils.queryDBFirstRow<undefined>(
        clientDb,
        `UPDATE [Lists] SET [Commodity] = '${listCommmodity}' WHERE [id] = ${listId}`
      );

      /**
       * @step 2
       * Write list-xxx.attributes based on own list-xxx columns
       *
       * – Get all locations from the DB
       * – Traverse and get all list-xxxx.attributes that are not included in list.schema
       * – Update the same list-xxxx table with a json string, format: {"column": "value"}
       * – grab the list-xxxx attributes object
       * – save the object inside the attributes column as a json string
       * – save valid list attributes into [ListAttributes] by checking if they exists first
       */
      const columnsToExclude = getListsLocsColumnsToExclude();
      logger.log(
        `Writing list-xxx.attributes based on own list-xxx columns. Excluding Columns: ${columnsToExclude}`
      );

      const listLocations = await SQLUtils.queryDB<unknown[]>(
        clientDb,
        `SELECT * FROM [${list.list_table_name}]`
      );
      logger.log(`List Locations found: ${listLocations.length}`);

      let listAttrToSave;
      for (let index = 0; index < listLocations.length; index++) {
        const record = listLocations[index];
        const validListAttrs = Object.keys(record).filter((col) => !columnsToExclude.includes(col));

        const locAttrObj = validListAttrs.reduce((acc, key) => {
          acc[key] = `${record[key]}`;
          return acc;
        }, {} as Record<string, unknown>);

        await SQLUtils.queryDBFirstRow<undefined>(
          clientDb,
          `UPDATE [${list.list_table_name}] 
          SET [attributes] = '${JSON.stringify(locAttrObj) ?? 'NULL'}' 
          WHERE [location_id] = ${record['location_id']}`
        );

        listAttrToSave = validListAttrs.map((attributeField) =>
          getFormattedAttributes({
            listId,
            attributeField,
            fieldValue: record[attributeField],
          })
        );
      }

      for (let index = 0; index < listAttrToSave.length; index++) {
        const listAttrRecord = listAttrToSave[index];
        const checkPayload = {
          clientDb,
          attributeName: listAttrRecord.attribute_name,
          listId,
        };
        if (!(await isExistingListAttr(checkPayload))) {
          await SQLUtils.queryDBFirstRow<undefined>(
            clientDb,
            `INSERT INTO [dbo].[ListAttributes]
              ([list_id]
              ,[attribute_name]
              ,[attribute_type])
            VALUES
              (${listAttrRecord.list_id}
              ,'${listAttrRecord.attribute_name}'
              ,${listAttrRecord.attribute_type})`
          );
        }
      }

      /**
       * @step 3
       * Update Lists.version=2 for given list_id
       */
      logger.log(`Updating list version ${list.version} to ${LIST_VERSION_POST_UPGRADE}`);
      await SQLUtils.queryDB<undefined>(
        clientDb,
        `UPDATE [Lists] SET [version] = ${LIST_VERSION_POST_UPGRADE} WHERE [id] = ${listId}`
      );

      logger.log(`Unlocking list`);
      await new UspSetListUnlocked().run(clientDb, list.id);
      logger.log(`Done.`);
    } else {
      logger.log(`List already in version 2, no op.`);
    }

    return list;
  } catch (error) {
    Logger.error(`Schema Upgrader Failed`, error.stack || error);
    throw error;
  }
}

async function isExistingListAttr({ clientDb, attributeName, listId }) {
  const { exists } = await SQLUtils.queryDBFirstRow<{ exists: number }>(
    clientDb,
    `SELECT COUNT(*) as 'exists' FROM [ListAttributes] WHERE [attribute_name] = '${attributeName}' AND [list_id] = ${listId}`
  );
  return !!exists;
}

async function getTemplateName(listTemplateId: number) {
  const templateData = await SQLUtils.queryDB<TemplateMetadata[]>('gfwpro', 'getTemplateMetadata');
  const template = templateData.find(({ template_id }) => template_id === listTemplateId);
  return template.template_name;
}

async function getCommodityCodeFromTemplate(templateName: string) {
  const ghgCodes = getGHGCodesMap();
  const ghgForUser = ghgCodes.find((v) => {
    return (
      v.commodities.includes(templateName.toLowerCase()) ||
      v.label.toLowerCase() === templateName.toLowerCase()
    );
  });

  return ghgForUser.value || `${GHG_PREFIX}_Unknown`;
}

type GHGCodeMapping = {
  value: string;
  label: string;
  commodities: string[];
};
function getGHGCodesMap(): GHGCodeMapping[] {
  const codeMap: { [key in GHG_MAPSPAM_CODES]?: string[] } = {};

  // group commodities by their GHG code
  Object.entries(COMMODITY_MAP_SPAM).forEach(([commodity, code]) => {
    if (!codeMap[code]) {
      codeMap[code] = [];
    }
    codeMap[code]?.push(commodity);
  });

  return Object.keys(codeMap).map((code: keyof typeof GHG_MAPSPAM_CODES) => ({
    value: code,
    label: COMMODITY_MAP_SPAM_CODES_FOR_HUMANS[code],
    commodities: codeMap[code] || [],
  }));
}
function getListsLocsColumnsToExclude() {
  const { options } = new EntitySchema<ListSchemaType>({
    ...ListSchema,
  });

  return Object.keys(options.columns).map((keyAcc) => {
    return options.columns[keyAcc].name;
  });
}
function inferType(value: unknown): string {
  if (value === null) {
    return 'string';
  }
  if (Array.isArray(value)) {
    return 'string';
  }
  if (typeof value === 'object') {
    return 'string';
  }
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return 'number';
    } else {
      return 'string';
    }
  }
  return typeof value;
}
function getFormattedAttributes({ listId, attributeField, fieldValue }) {
  enum ListsAttrsTypes {
    Int = 1,
    Text = 2,
  }
  return {
    list_id: listId,
    attribute_name: attributeField,
    attribute_type: inferType(fieldValue) === 'number' ? ListsAttrsTypes.Int : ListsAttrsTypes.Text,
  };
}
export enum GHG_MAPSPAM_CODES {
  COCO = 'COCO',
  COFF = 'COFF',
  OILP = 'OILP',
  RUBB = 'RUBB',
  SOYB = 'SOYB',
  SUGC = 'SUGC',
}
export const COMMODITY_MAP_SPAM = {
  ['arabica coffee']: GHG_MAPSPAM_CODES.COFF,
  ['cocoa']: GHG_MAPSPAM_CODES.COCO,
  ['oilpalm']: GHG_MAPSPAM_CODES.OILP,
  ['robusta coffee']: GHG_MAPSPAM_CODES.COFF,
  ['rubber']: GHG_MAPSPAM_CODES.RUBB,
  ['soybean']: GHG_MAPSPAM_CODES.SOYB,
  ['sugarcane']: GHG_MAPSPAM_CODES.SUGC,
  ['cocoa farm']: GHG_MAPSPAM_CODES.COCO,
  ['cocoa generic']: GHG_MAPSPAM_CODES.COCO,
  ['palm oil plantation']: GHG_MAPSPAM_CODES.OILP,
  ['palm oil generic']: GHG_MAPSPAM_CODES.OILP,
  ['palm smallholder farm']: GHG_MAPSPAM_CODES.OILP,
  ['palm oil mill']: GHG_MAPSPAM_CODES.OILP,
  ['soy farm']: GHG_MAPSPAM_CODES.SOYB,
  ['soy generic']: GHG_MAPSPAM_CODES.SOYB,
  ['sugar cane']: GHG_MAPSPAM_CODES.SUGC,
};
export const COMMODITY_MAP_SPAM_CODES_FOR_HUMANS = {
  [GHG_MAPSPAM_CODES.COFF]: 'Coffee',
  [GHG_MAPSPAM_CODES.COCO]: 'Cocoa Generic',
  [GHG_MAPSPAM_CODES.OILP]: 'Palm Oil Generic',
  [GHG_MAPSPAM_CODES.RUBB]: 'Rubber',
  [GHG_MAPSPAM_CODES.SOYB]: 'Soy Generic',
  [GHG_MAPSPAM_CODES.SUGC]: 'Sugar Cane',
};
export const MAPSPAM_COMMODITY = {
  COFF: 'Coffee',
  COCO: 'Cocoa Generic',
  OILP: 'Palm Oil Generic',
  RUBB: 'Rubber',
  SOYB: 'Soy Generic',
  SUGC: 'Sugar Cane',
};

export enum GHG_PREFIX {
  VALUE = 'GFWP_',
}
