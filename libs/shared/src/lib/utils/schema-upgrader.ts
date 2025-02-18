/**
 * @summary update list schema from version 1 to 2
 * –––––––––––––
 * @description 
 * — Multiple is not supported in v1
 * — Commodity=Other is supported only if they specify yield
 * — Commodity=Unknown is not supported
 * — API default when uploading lists will be Commodity=Unknown unless user specifies otherwise
 * — DB internally will store 4 letter Mapspam codes, but both input and output CSVs will require full English names
 * — @note 
 *    For commodities in the Pro UI that are not in MapSPAM, 
 *    we’ll create special values with GFWP_ prefix. 
 *    These will not result in GHG analysis.
 * –––––––––––––
 * @param clientDb string 
 * @param listId number
 * @param userId number
*/
import { Logger } from "@nestjs/common";
import { COMMODITY_MAP_SPAM, COMMODITY_MAP_SPAM_CODES_FOR_HUMANS, GHG_MAPSPAM_CODES, GHG_PREFIX } from "@wri-monorepos/constants";

import { ClientStoreConnection, Lists, SQLUtils, TemplateMetadata, UspSetListLocked } from "@wri-monorepos/sql";


// todo: determine when to use GFWP_Multiple, GFWP_Other, GFWP_Unknown
const LIST_UPGRADE_VERSION = 2;

interface SchemaUpgraderArgs {
  clientDb: string, 
  listId: number,
  userId: number,
}
export default async function upgradeListSchema(args: SchemaUpgraderArgs) {
  const { 
    clientDb, 
    listId,
    userId
  } = args;
  try {
    const clientStoreConnection = new ClientStoreConnection();
    const connection = await clientStoreConnection.getConnection(clientDb);
    const repository = connection.getRepository(Lists);
    const list = await repository.findOne({ where: { id: listId } });

    // check if list is version = 2
    if (list.version === LIST_UPGRADE_VERSION) {
      // lock list
      await new UspSetListLocked().run(clientDb, list.id, userId);

      const templateName = await getTemplateName(clientDb, list.templateId);

      // todo: Write Lists.Commodity based on Lists.template_id for given list_id. 
      await writeListCommodityToList(list, templateName);

      // todo: Write list-xxx.attributes based on other list-xxx columns
      // todo: Update Lists.version=2 for given list_id
      // todo: UnlockList
    }
  } catch (error) {
    Logger.error(`Schema Upgrader Failed`, error.stack || error);
    throw error;
  }
	// do nothing
}

async function writeListCommodityToList(list: Lists, templateName: string) {

  // See https://gfw.atlassian.net/browse/GPV-3983
  list.Commodity = await getCommodityCodeFromTemplate(templateName);
  return Promise.resolve(true);
}

async function getTemplateName(clientDb: string, listTemplateId: number) {
  const templateData = await SQLUtils.queryDB<TemplateMetadata[]>(
    clientDb, 
    'uspGetTemplateMetadata', 
    null
  );
  const template = templateData.find(
    ({ template_id }) => template_id === listTemplateId
  );
  return template.template_name;
}

async function getCommodityCodeFromTemplate(templateName: string) {
  const ghgObject = getGHGObject(templateName);
  return templateName;
}

async function writeListColumnsToListAttributes(list: unknown) {
  return Promise.resolve(true);
}


type GHGCodeMapping = {
  label: string;
  commodities: string[];
};
function mapGHGCodesToCommodities(): GHGCodeMapping[] {
  const codeMap: { [key in GHG_MAPSPAM_CODES]?: string[] } = {};
  
  // group commodities by their GHG code
  Object.entries(COMMODITY_MAP_SPAM).forEach(([commodity, code]) => {
    if (!codeMap[code]) {
      codeMap[code] = [];
    }
    codeMap[code]?.push(commodity);
  });

  return Object.keys(codeMap).map((code) => {
    const ghgCode = code as GHG_MAPSPAM_CODES;
    return {
      code,
      label: COMMODITY_MAP_SPAM_CODES_FOR_HUMANS[ghgCode],
      commodities: codeMap[ghgCode] || [],
    };
  });
}

function getGHGObject(templateName: string) {
  const commodityCode = COMMODITY_MAP_SPAM[templateName.toLowerCase()];

  if (commodityCode) {
    return mapGHGCodesToCommodities().find((item) => item.label === COMMODITY_MAP_SPAM_CODES_FOR_HUMANS[commodityCode]);
  }

  return {
    code: `${GHG_PREFIX.VALUE}Other`,
    label: '',
    commodities: [],
  };
}