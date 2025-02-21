/**
 * @summary update list schema from version 1 to 2
 * 1 - Write Lists.Commodity based on Lists.template_id for given list_id
 * 2 - Write list-xxx.attributes based on other list-xxx columns
 * 3 - Update Lists.version=2 for given list_id
 * –––––––––––––––––––––––––––––––––––––––
 * @notes
 * — Multiple is not supported in v1
 * — Commodity=Other is supported only if they specify yield
 * — Commodity=Unknown is not supported
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
import { TemplateMetadata } from '../queries';
import { EntitySchema } from 'typeorm';

const LIST_UPGRADE_VERSION = 2;

interface SchemaUpgraderArgs {
  clientDb: string;
  listId: number;
  userId: number;
}
export default async function upgradeListSchema(args: SchemaUpgraderArgs) {
  const { clientDb, listId, userId } = args;
  const logger = new Logger(`Schema Upgrade [dbo].[${clientDb}]. ListId: ${listId}`);
  try {
    const db = new ClientStoreConnection();
    const connection = await db.getConnection(clientDb);
    const listRepo = connection.getRepository(Lists);
    const list = await listRepo.findOne({ where: { id: listId } });

    logger.log(`Lock ${listId}`);

    if (list.version !== LIST_UPGRADE_VERSION) {
      await new UspSetListLocked().run(clientDb, list.id, userId);

      // 1. Write Lists.Commodity based on Lists.template_id for given list_id. See https://gfw.atlassian.net/browse/GPV-3983
      const templateName = await getTemplateName(clientDb, list.templateId);
      list.Commodity = await getCommodityCodeFromTemplate(templateName, list.Commodity);
      logger.log(`list.Commodity = ${list.Commodity}. TemplateName: ${templateName}`);

      // 2. Write list-xxx.attributes based on other list-xxx columns ––– [STARTS]
      const ListLocations = new EntitySchema<ListSchemaType>({
        ...ListSchema,
        name: list.listTableName,
      });

      const listLocsRepo = connection.getRepository(ListLocations);
      const listLocationsData = await listLocsRepo.find();
      const { selectFields } = getListsLocsAttrsRules();
      await Promise.all(
        listLocationsData.map(async (listLocRow, indx) => {
          const attributes = selectFields.map((propertyKey) => {
            const value = listLocRow[propertyKey];
            const inferredType = inferType(value);
            return {
              field: propertyKey,
              value,
              type: inferredType,
            };
          });

          if (indx === 0) {
            const formatedAttributes = getFormattedAttributes(listId, attributes);
            const connToSaveAttributes = await db.getConnection(clientDb, [ListAttributes]);
            await connToSaveAttributes
              .createQueryBuilder()
              .insert()
              .into(ListAttributes)
              .values(formatedAttributes)
              // .orIgnore()
              .execute();
            logger.log(`Saved [ListAttributes]`);
          }

          listLocRow.attributes = JSON.stringify(attributes);
          // save list-xxx attributes
          const connToSaveListLocs = await db.getConnection(clientDb, [ListLocations]);
          await connToSaveListLocs
            .createQueryBuilder()
            .insert()
            .into(ListLocations)
            .values(listLocRow)
            // .orIgnore()
            .execute();
          logger.log(`Saved [${list.listTableName}].attributes`);
          return true;
        })
      );
      // 2. Write list-xxx.attributes based on other list-xxx columns –––  [ENDS]

      // 3. Update Lists.version=2 for given list_id
      list.version = LIST_UPGRADE_VERSION;
      logger.log(`Updated list version ${list.version}`);
      // save list
      const connToSavelList = await db.getConnection(clientDb, [Lists]);
      await connToSavelList
        .createQueryBuilder()
        .insert()
        .into(Lists)
        .values(list)
        // .orIgnore()
        .execute();
      logger.log(`list Saved`);

      // unlockListxx
      await new UspSetListUnlocked().run(clientDb, list.id);
      logger.log(`Done.`);
    }
  } catch (error) {
    Logger.error(`Schema Upgrader Failed`, error.stack || error);
    throw error;
  }
}

async function getTemplateName(clientDb: string, listTemplateId: number) {
  const templateData = await SQLUtils.queryDB<TemplateMetadata[]>(
    clientDb,
    'uspGetTemplateMetadata',
    null
  );
  const template = templateData.find(({ template_id }) => template_id === listTemplateId);
  return template.template_name;
}

async function getCommodityCodeFromTemplate(templateName: string, userMaybeFallback: string) {
  const ghgCodes = getGHGCodesMap();
  const ghgForUser = ghgCodes.find((v) => {
    return (
      v.commodities.includes(templateName.toLowerCase()) ||
      v.label.toLowerCase() === templateName.toLowerCase()
    );
  });

  return ghgForUser.value || userMaybeFallback || `${GHG_PREFIX}_Unknown`;
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
function getListsLocsAttrsRules() {
  const columnsToExclude = [
    'locationName',
    'longitude',
    'latitude',
    'commodity',
    'attributes',
    'errorDetails',
    'analysisArea',
    'analysisRadius',
    // generated by GADM service
    'subState',
    'state',
    'country',
    'gadmid',
  ];
  const { options } = new EntitySchema<ListSchemaType>({
    ...ListSchema,
  });
  const { columns } = options;
  const selectFields = Object.keys(columns).filter((field) => {
    const fieldDef = columns[field];
    return fieldDef.nullable === true && !columnsToExclude.includes(field);
  });
  return { selectFields, columnsToExclude } as const;
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
function getFormattedAttributes(listId, attributes) {
  enum ListsAttrsTypes {
    Int = 1,
    Text = 2,
  }
  return {
    list_id: listId,
    attribute_name: attributes[0].field,
    attribute_type: attributes[0].type === 'number' ? ListsAttrsTypes.Int : ListsAttrsTypes.Text,
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
// for unexisting codes, multiple, unknown or other
export enum GHG_PREFIX {
  VALUE = 'GFWP_',
}
