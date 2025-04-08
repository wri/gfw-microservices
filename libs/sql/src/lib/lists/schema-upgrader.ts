/**
 * @summary update list schema from version 1 to 2
 * 1 - Write list-xxx.attributes based on other list-xxx columns
 * 2 - Write Lists.Commodity based on Lists.template_id for given list_id
 * 3 - Update Lists.version=2 for given list_id
 * 4 - Handle ListsAnalysisStatus.options based on template_id+locationClassification
 * –––––––––––––––––––––––––––––––––––––––
 * @notes for the [Commodity] column values:
 * — Multiple is not supported in v1, lists with templates using investment will use GFWP_Miltiple
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
import { Lists, ListsAnalysisStatus } from '../entity';
import {
  getCommodityCodeFromTemplate,
  getFormattedAttributes,
  getListsLocsColumnsToExclude,
  getTemplateName,
  saveListAttributes,
} from '../list-attributes';

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
    const clientStoreConnection = new ClientStoreConnection();
    const connection = await clientStoreConnection.getConnection(clientDb);
    const listsRepository = connection.getRepository(Lists);
    const list = await listsRepository.findOne({
      where: { id: listId },
    });

    if (list.version === LIST_VERSION_POST_UPGRADE) {
      logger.log(`List already in version 2, no op.`);
      return list;
    }

    logger.log(`Locking list`);
    await new UspSetListLocked().run(clientDb, list.id, userId);

    /**
     * @step 1
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
      `SELECT * FROM [${list.listTableName}]`
    );
    logger.log(`List Locations found: ${listLocations.length}`);

    if (listLocations.length) {
      const validListAttrs = Object.keys(listLocations[0] ?? {}).filter(
        (col) => !columnsToExclude.includes(col)
      );

      for (let index = 0; index < listLocations.length; index++) {
        const record = listLocations[index];

        const locAttrObj = validListAttrs.reduce((acc, key) => {
          if (record[key] === null) {
            return acc;
          }
          acc[key] = `${record[key]}`;
          return acc;
        }, {} as Record<string, unknown>);

        const attrValue = Object.keys(locAttrObj).length
          ? `'${JSON.stringify(locAttrObj)}'`
          : 'NULL';

        const updateQuery = `UPDATE [${list.listTableName}] 
          SET [attributes] = {ATTR_VALUE}  
          WHERE [location_id] = ${record['location_id']}`.replace('{ATTR_VALUE}', attrValue);

        await SQLUtils.queryDBFirstRow<undefined>(clientDb, updateQuery);
      }

      const listAttrsToSave = validListAttrs.map((attributeField) =>
        getFormattedAttributes({
          listId,
          attributeField,
          fieldValue: listLocations[0]?.[attributeField],
        })
      );

      // save into ListAttributes tables, handles constraints
      await saveListAttributes(clientDb, listAttrsToSave);
    }

    /**
     * @step 2
     * Write Lists.Commodity based on Lists.template_id for given list_id
     * see {@link https://gfw.atlassian.net/browse/GPV-3983}
     *
     * @step 3
     * Update Lists.version=2 for given list_id
     */
    const templateName = await getTemplateName(list.templateId);
    const listCommmodity = getCommodityCodeFromTemplate(templateName, list.Commodity);

    logger.log(`Writing list.[Commodity] = ${listCommmodity} from template: ${templateName}`);
    logger.log(`Updating list version ${list.version} to ${LIST_VERSION_POST_UPGRADE}`);
    await listsRepository.update(
      { id: listId },
      {
        Commodity: listCommmodity,
        version: LIST_VERSION_POST_UPGRADE,
      }
    );

    /**
     * @step 4
     * Handle ListsAnalysisStatus.options given template_id and locationClassification
     * see {@link https://gfw.atlassian.net/browse/GPV-4274}
     */
    const lowerLocationClass = list.locationClassification.toLowerCase();
    if (list.templateId === 2 || (list.templateId === 5 && lowerLocationClass === 'supply shed')) {
      logger.log(`Handling ListsAnalysisStatus.options for list.`);
      const listAnalisisStatusRepo = connection.getRepository(ListsAnalysisStatus);
      await listAnalisisStatusRepo.update(
        {
          listId: list.id,
          analysisId: 'FCD',
        },
        {
          options: 'PalmRisk',
        }
      );
    }

    return await listsRepository.findOne({
      where: { id: listId },
    });
  } catch (error) {
    Logger.error(`Schema Upgrader Failed`, error.stack || error);
    throw error;
  } finally {
    logger.log(`Unlocking list`);
    await new UspSetListUnlocked().run(clientDb, listId);
    logger.log(`Done.`);
  }
}
