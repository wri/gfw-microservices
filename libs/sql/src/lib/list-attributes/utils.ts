import { EntitySchema } from 'typeorm';
import { Logger } from '@nestjs/common';
import { ListAttributes, ListSchema, ListSchemaType, ListTemplate } from '../entity';
import { ClientStoreConnection, SQLUtils } from '../util';
import { TemplateMetadata } from '../queries';
import { COMMODITY_MAP_SPAM, MAPSPAM_COMMODITY, GHG_PREFIX, MAPSPAM_CODES } from './comMapSpam';

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
