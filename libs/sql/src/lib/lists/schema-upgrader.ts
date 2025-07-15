/**
 * @summary update list schema from version 1 to 2
 * 1 - Get entity based columns definitions. Get rest of current list-xxxx columns.Check if is Investment and needs adjustment
 * 2 - Handle list locations atts. Delete columns outside entity
 * 3 - Write Lists.Commodity based on Lists.template_id for given list_id
 * 4 - Update Lists.version=2 for given list_id
 * 5 - Handle ListsAnalysisStatus.options based on template_id+locationClassification
 * –––––––––––––––––––––––––––––––––––––––
 * @notes for the [Commodity] column values:
 * — Multiple is not supported in v1, lists with templates using investment will use GFWP_Multiple
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
import { ClientStoreConnection } from '../util';
import { UspSetListUnlocked } from './uspSetListUnlocked';
import { UspSetListLocked } from './uspSetListLocked';
import { Lists, ListsAnalysisStatus } from '../entity';
import {
  getListLocationsColumnsToDelete,
  getCommodityCodeFromTemplate,
  getListsLocsColumnsToExclude,
  getTemplateName,
  setListLocationNameIfIsInvestment,
  handleListLocationAttributes,
} from '../list-attributes';
import { getListIfEAPIExportUpload } from './getListIfEAPIExportUpload';
import { GHG_PREFIX } from '../list-attributes/comMapSpam';
import { QueryRunner } from 'typeorm';

const LIST_VERSION_POST_UPGRADE = 2;

interface SchemaUpgraderArgs {
  clientDb: string;
  listId: number;
  userId: number;
}
export async function upgradeListSchema(args: SchemaUpgraderArgs) {
  const { clientDb, listId, userId } = args;
  const logger = new Logger(`SchemaUpgrade for ListId: ${listId}`);
  let queryRunner: QueryRunner;

  let success = false;
  try {
    const clientStoreConnection = new ClientStoreConnection();
    const connection = await clientStoreConnection.getConnection(clientDb);
    queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const listsRepository = queryRunner.manager.getRepository(Lists);
    const list = await listsRepository.findOne({
      where: { id: listId },
    });
    if (list.version === LIST_VERSION_POST_UPGRADE) {
      logger.log('List already in version 2, no op.');
      queryRunner.commitTransaction();
      return list;
    }

    logger.log('Locking list');
    await new UspSetListLocked().run(clientDb, list.id, userId);

    /**
     * @step 1
     * Get entity based columns definitions
     * Get rest of current list-xxxx columns
     * Check if is Investment and needs adjustment
     */
    const columnsToExclude = getListsLocsColumnsToExclude();
    logger.log(
      `Writing list-xxx.attributes based on own list-xxx columns. Excluding Columns: ${columnsToExclude.join(
        ', '
      )}`
    );
    const columnsToDelete = await getListLocationsColumnsToDelete(
      clientDb,
      list.listTableName,
      columnsToExclude
    );
    if (columnsToDelete.includes('Investment Name')) {
      logger.log('Setting [Location Name] for Investment List');
      await setListLocationNameIfIsInvestment(queryRunner, list.listTableName);
    }

    /**
     * @step 2
     * Handle list locations atts
     * Delete columns outside entity
     */
    await handleListLocationAttributes(queryRunner, list, columnsToExclude);

    if (columnsToDelete.length) {
      logger.log(
        `Dropping the following columns from [${list.listTableName}]: ${columnsToDelete.join(', ')}`
      );

      const dropStatement = `
        ALTER TABLE [${list.listTableName}]
        DROP COLUMN ${columnsToDelete.map((col) => `[${col}]`).join(', ')}
      `;

      await queryRunner.query(dropStatement);
    } else {
      logger.log(
        `No columns to drop in [${list.listTableName}]! Everything matches the entity definition.`
      );
    }

    /**
     * @step 3
     * Write Lists.Commodity based on Lists.template_id for given list_id
     * see {@link https://gfw.atlassian.net/browse/GPV-3983}
     *
     * @step 4
     * Update Lists.version=2 for given list_id
     */
    const templateName = await getTemplateName(list.templateId);
    let listCommodity = getCommodityCodeFromTemplate(templateName, list.Commodity);

    // Check if the list was uploaded by EAPI
    const wasUploadedByEAPI = await getListIfEAPIExportUpload(clientDb, list.id);
    if (templateName === 'Cocoa Generic' && wasUploadedByEAPI) {
      listCommodity = `${GHG_PREFIX}_Unknown`;
    }
    logger.log(`Writing list.[Commodity] = ${listCommodity} from template: ${templateName}`);
    logger.log(`Updating list version ${list.version} to ${LIST_VERSION_POST_UPGRADE}`);
    await listsRepository.update(
      { id: listId },
      {
        Commodity: listCommodity,
        version: LIST_VERSION_POST_UPGRADE,
        templateId: 0,
      }
    );

    /**
     * @step 5
     * Handle ListsAnalysisStatus.options given template_id and locationClassification
     * see {@link https://gfw.atlassian.net/browse/GPV-4274}
     */
    const lowerLocationClass = list.locationClassification?.toLowerCase();
    if (list.templateId === 2 || (list.templateId === 5 && lowerLocationClass === 'supply shed')) {
      logger.log('Handling ListsAnalysisStatus.options for list.');
      const listAnalysisStatusRepo = queryRunner.manager.getRepository(ListsAnalysisStatus);
      await listAnalysisStatusRepo.update(
        {
          listId: list.id,
          analysisId: 'FCD',
        },
        {
          options: 'PalmRisk',
        }
      );
    }

    await queryRunner.commitTransaction();
    success = true;

    return await listsRepository.findOne({
      where: { id: listId },
    });
  } catch (error) {
    await queryRunner?.rollbackTransaction();
    Logger.error('Schema Upgrader Failed', error.stack || error);
    throw error;
  } finally {
    await queryRunner?.release();

    try {
      if (success) {
        logger.log('Unlocking list');
        await new UspSetListUnlocked().run(clientDb, listId);
        logger.log('Done.');
      } else {
        logger.warn('Skipping unlock due to failed transaction');
      }
    } catch (unlockErr) {
      logger.error('Failed to unlock list', unlockErr.stack || unlockErr);
    }
  }
}
