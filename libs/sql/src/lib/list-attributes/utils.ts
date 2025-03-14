import { EntitySchema } from "typeorm";
import { Logger } from "@nestjs/common";
import { ListAttributes, ListSchema, ListSchemaType } from "../entity";
import { ClientStoreConnection, SQLUtils } from "../util";
import { TemplateMetadata } from "../queries";

export function inferType(value: unknown): string {
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
enum ListsAttrsTypes {
  Int = 1,
  Text = 2,
}
export function getFormattedAttributes({ listId, attributeField, fieldValue }): ListAttributesRecord {
  return {
    list_id: listId,
    attribute_name: attributeField,
    attribute_type: inferType(fieldValue) === 'number' ? ListsAttrsTypes.Int : ListsAttrsTypes.Text,
  };
}
export function getListsLocsColumnsToExclude() {
  const { options } = new EntitySchema<ListSchemaType>({
    ...ListSchema,
  });

  return Object.keys(options.columns).map((keyAcc) => {
    return options.columns[keyAcc].name;
  });
}

export interface ListAttributesRecord {
  list_id: number;
  attribute_name: string;
  attribute_type: number;
}
export async function saveListAttributes(clientDb, attributes: ListAttributesRecord[]) {
  try {
    // insert new attributes with Typeorm listAttributes entity
    const clientStore = new ClientStoreConnection();
    const connection = await clientStore.getConnection(clientDb, [ListAttributes]);

    Logger.log(`Inserting ${attributes.length} into [ListAttributes]`);

    await connection
      .createQueryBuilder()
      .insert()
      .into(ListAttributes)
      .values(attributes)
      .orIgnore()
      .execute();
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

export const GHG_PREFIX = 'GFWP_';

export const MAPSPAM_CODES = {
  COCO: 'COCO',
  COFF: 'COFF',
  OILP: 'OILP',
  RUBB: 'RUBB',
  SOYB: 'SOYB',
  SUGC: 'SUGC',
  RCOF: 'RCOF',
};

export const COMMODITY_MAP_SPAM = {
  ['arabic coffee']: MAPSPAM_CODES.COFF,
  ['coffee']: MAPSPAM_CODES.COFF,
  ['cocoa']: MAPSPAM_CODES.COCO,
  ['cocoa farm']: MAPSPAM_CODES.COCO,
  ['cocoa generic']: MAPSPAM_CODES.COCO,
  ['oilpalm']: MAPSPAM_CODES.OILP,
  ['palm oil']: MAPSPAM_CODES.OILP,
  ['palm oil plantation']: MAPSPAM_CODES.OILP,
  ['palm oil generic']: MAPSPAM_CODES.OILP,
  ['palm smallholder farm']: MAPSPAM_CODES.OILP,
  ['palm oil mill']: MAPSPAM_CODES.OILP,
  ['robust coffee']: MAPSPAM_CODES.RCOF,
  ['rubber']: MAPSPAM_CODES.RUBB,
  ['soybean']: MAPSPAM_CODES.SOYB,
  ['sugarcane']: MAPSPAM_CODES.SUGC,
  ['sugar cane']: MAPSPAM_CODES.SUGC,
  ['soy']: MAPSPAM_CODES.SOYB,
  ['soy farm']: MAPSPAM_CODES.SOYB,
  ['soy generic']: MAPSPAM_CODES.SOYB,
};

export const MAPSPAM_COMMODITY = {
  COFF: 'Coffee',
  COCO: 'Cocoa Generic',
  OILP: 'Palm Oil Generic',
  RUBB: 'Rubber',
  SOYB: 'Soy Generic',
  SUGC: 'Sugar Cane',
};

export const COMMODITY_MAP_SPAM_CODES_FOR_HUMANS = {
  [MAPSPAM_CODES.COFF]: 'Coffee',
  [MAPSPAM_CODES.COCO]: 'Cocoa Generic',
  [MAPSPAM_CODES.OILP]: 'Palm Oil Generic',
  [MAPSPAM_CODES.RUBB]: 'Rubber',
  [MAPSPAM_CODES.SOYB]: 'Soy Generic',
  [MAPSPAM_CODES.SUGC]: 'Sugar Cane',
};

export async function getTemplateName(listTemplateId: number) {
  const templateData = await SQLUtils.queryDB<TemplateMetadata[]>('gfwpro', 'getTemplateMetadata');
  const template = templateData.find(({ template_id }) => template_id === listTemplateId);
  return template.template_name;
}

function searchCommodityCodeFromTerm(searchTerm: string) {
  return getGHGCodesMap().find(
    (code) =>
      code.commodities.includes(searchTerm.toLowerCase()) ||
      code.label.toLowerCase() === searchTerm.toLowerCase() ||
      code.value.toLocaleLowerCase() === searchTerm.toLowerCase()
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
    label: COMMODITY_MAP_SPAM_CODES_FOR_HUMANS[code],
    commodities: codeMap[code] || [],
  }));
}