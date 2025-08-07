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
  isDryRun?: boolean;
}
export async function upgradeListSchema(args: SchemaUpgraderArgs) {
  const { clientDb, listId, userId, isDryRun = false } = args;
  const logger = new Logger(`SchemaUpgrade for ListId: ${listId}`);
  let success = false;

  try {
    const clientStoreConnection = new ClientStoreConnection();
    const connection = await clientStoreConnection.getConnection(clientDb);
    let list: Lists | undefined;
    let listsRepository;
    await connection.manager.transaction(async (transactionalEntityManager) => {
       listsRepository = transactionalEntityManager.getRepository(Lists);
       list = await listsRepository.findOne({ where: { id: listId } });
    });
    if (list.version === LIST_VERSION_POST_UPGRADE) {
      logActionMessage(logger, isDryRun, 'Skip upgrade', `List already in version 2`);
      if (isDryRun) {
        logger.log('(Dry Run) - Rolling back transaction.');
      } else {
      }
      return list;
    }
  
    logActionMessage(logger, isDryRun, 'Lock', `list ${list.id}`, `for user ${userId}`);
    if (!isDryRun) {
      await new UspSetListLocked().run(clientDb, list.id, userId);
    }
  
    /**
     * @step 1
     * Get entity based columns definitions
     * Get rest of current list-xxxx columns
     * Check if is Investment and needs adjustment
     */
    const columnsToExclude = getListsLocsColumnsToExclude();
    logger.log(`Excluding Columns: ${columnsToExclude.join(', ')}`);

    const columnsToDelete = await getListLocationsColumnsToDelete(
      clientDb,
      list.listTableName,
      columnsToExclude
    );

    if (columnsToDelete.includes('Investment Name')) {
      logActionMessage(logger, isDryRun, 'Set', '[Location Name] for Investment List');
      if (!isDryRun) {
        await connection.manager.transaction(async (transactionalEntityManager) => {
          await setListLocationNameIfIsInvestment(transactionalEntityManager, list.listTableName);
        });
      }
    }

    /**
     * @step 2
     * Handle list locations atts
     * Delete columns outside entity
     */
    logActionMessage(
      logger,
      isDryRun,
      'Handle',
      `list location attributes for ${list.listTableName}`
    );
    if (!isDryRun) {
      await connection.manager.transaction(async (transactionalEntityManager) => {
        await handleListLocationAttributes(transactionalEntityManager, list, columnsToExclude);
      });
    }

    if (columnsToDelete.length) {
      logActionMessage(
        logger,
        isDryRun,
        'Drop columns',
        `[${list.listTableName}]`,
        columnsToDelete.join(', ')
      );

      if (!isDryRun) {
        const dropStatement = `
          ALTER TABLE [${list.listTableName}]
          DROP COLUMN ${columnsToDelete.map((col) => `[${col}]`).join(', ')}
        `;
        await connection.manager.transaction(async (transactionalEntityManager) => {
          await transactionalEntityManager.query(dropStatement);
        });
      }
    } else {
      logger.log(`No columns to drop in [${list.listTableName}].`);
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

    const wasUploadedByEAPI = await getListIfEAPIExportUpload(clientDb, list.id);
    if (templateName === 'Cocoa Generic' && wasUploadedByEAPI) {
      listCommodity = `${GHG_PREFIX}_Unknown`;
    }

    logActionMessage(
      logger,
      isDryRun,
      'Update',
      'Lists table',
      `set Commodity = ${listCommodity}, version = ${LIST_VERSION_POST_UPGRADE}, templateId = 0`
    );

    if (!isDryRun) {
      await listsRepository.update(
        { id: listId },
        {
          Commodity: listCommodity,
          version: LIST_VERSION_POST_UPGRADE,
          templateId: 0,
        }
      );
    }

    /**
     * @step 5
     * Handle ListsAnalysisStatus.options given template_id and locationClassification
     * see {@link https://gfw.atlassian.net/browse/GPV-4274}
     */
    const lowerLocationClass = list.locationClassification?.toLowerCase();
    if (list.templateId === 2 || (list.templateId === 5 && lowerLocationClass === 'supply shed')) {
      logActionMessage(logger, isDryRun, 'Update', 'ListsAnalysisStatus.options', `to PalmRisk`);
      if (!isDryRun) {
        await connection.manager.transaction(async (transactionalEntityManager) => {
        const listAnalysisStatusRepo = transactionalEntityManager.getRepository(ListsAnalysisStatus);
        await listAnalysisStatusRepo.update(
          {
            listId: list.id,
            analysisId: 'FCD',
          },
          {
            options: 'PalmRisk',
          }
        );
      })
      }
    }

    if (isDryRun) {
      logger.log('(Dry Run) - Rolling back transaction.');
    } else {
      success = true;
    }

    return await listsRepository.findOne({ where: { id: listId } });
  } catch (error) {
    Logger.error('Schema Upgrader Failed', error.stack || error);
    throw error;
  } finally {

    try {
      if (!isDryRun && success) {
        logActionMessage(logger, isDryRun, 'Unlock', `list ${listId}`);
        await new UspSetListUnlocked().run(clientDb, listId);
        logger.log('Done.');
      } else if (isDryRun) {
        logger.log('(Dry Run) - Complete. No unlocking necessary.');
      } else {
        logger.warn('Skipping unlock due to failed transaction');
      }
    } catch (unlockErr) {
      logger.error('Failed to unlock list', unlockErr.stack || unlockErr);
    }
  }
}

/**
 * Logs an action message with optional reason and level.
 */
function logActionMessage(
  logger: Logger,
  isDryRun: boolean,
  action: string,
  target: string,
  reason?: string,
  level: 'log' | 'warn' | 'debug' = 'warn'
) {
  const prefix = isDryRun ? '(Dry Run) - Would' : '';
  const message = reason?.trim()
    ? `${prefix} ${action} ${target}: (${reason.trim()})`
    : `${prefix} ${action} ${target}`;

  logger[level](message);
}
