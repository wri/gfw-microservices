import { Brackets } from 'typeorm';
import { ClientStoreConnection } from '../util';
import { ListsProcessing } from '../entity/organization';
import { OrganizationAnalysisUsageByAnalysisType as OrganizationAnalysisUsageResponseByAnalysisType } from '../queries/organization/getOrganizationAnalysisUsageByAnalysisType';

interface GetAccountAnalysisUsageByAnalysisType {
  startDate: string;
  endDate: string;
  orgDbName: string;
}
/**
 * Posbile duplicate
 * canonical definition exists in {@link libs/constants/src/lib/analysisTypes.constants.ts}
 *
 * @summary libs/constants is not buildable and libs/sql complaints about
 * not finding the contents of the filepath above. This constant is duplicated here
 * to avoid cross-package import issues (e.g., circular dependencies or build constraints).
 * If possible, consider refactoring to use a shared constants module to avoid duplication.
 */
export enum ListAnalysisIds {
  FCD = 'FCD',
  AFI = 'AFI',
  ALERTS = 'ALERTS',
  ALERTS_BATCH = 'ALERTS-BATCH',
  GHG = 'GHG',
}

// Define all possible analysis types with their display order
const ALL_ANALYSIS_TYPES = [
  { type: ListAnalysisIds.FCD, order: 1 },
  { type: ListAnalysisIds.AFI, order: 2 },
  { type: ListAnalysisIds.ALERTS, order: 3 },
  { type: ListAnalysisIds.ALERTS_BATCH, order: 4 },
  { type: ListAnalysisIds.GHG, order: 5 },
];

export async function getAccountAnalysisUsageByAnalysisType({
  startDate,
  endDate,
  orgDbName,
}: GetAccountAnalysisUsageByAnalysisType): Promise<
  OrganizationAnalysisUsageResponseByAnalysisType[]
> {
  const GHG_ANALYSIS_TYPE = 'GHG';
  const GHG_CHARGING_START_DATE = new Date('2025-11-22T00:00:00.000Z');

  const clientStoreConnection = new ClientStoreConnection();
  const connection = await clientStoreConnection.getConnection(orgDbName);
  const listsProcessingRepository = connection.getRepository(ListsProcessing);

  const startDateTime = new Date(`${startDate}T00:00:00.000Z`);
  const endDateTime = new Date(`${endDate}T23:59:59.997Z`);

  // Use TypeORM query builder to match the exact SQL query structure
  const results = await listsProcessingRepository
    .createQueryBuilder('lp')
    .select(
      `ISNULL(SUM(CASE WHEN lp.analysisType = :ghgAnalysisType AND lp.analysisEndTime < :ghgChargingStartDate THEN 0 ELSE lp.areaAnalyzedLocationsHa END), 0)`,
      'total_area_analyzed'
    )
    .addSelect(
      `ISNULL(MAX(CASE WHEN lp.analysisType = :ghgAnalysisType AND lp.analysisEndTime < :ghgChargingStartDate THEN 0 ELSE lp.areaAnalyzedLocationsHa END), 0)`,
      'max_area_analyzed'
    )
    .addSelect('COUNT(DISTINCT lp.listId)', 'total_lists_analyzed')
    .addSelect(
      `ISNULL(SUM(CASE WHEN lp.analysisType = :ghgAnalysisType AND lp.analysisEndTime < :ghgChargingStartDate THEN 0 ELSE lp.locationsAnalyzed END), 0)`,
      'total_locations_analyzed'
    )
    .addSelect('lp.analysisType', 'analysis_type')
    .where('lp.analysisEndTime >= :startDateTime', { startDateTime })
    .andWhere('lp.analysisEndTime <= :endDateTime', { endDateTime })
    .andWhere('lp.userId IS NOT NULL')
    .andWhere(
      new Brackets((qb) =>
        qb
          .where('lp.analysisType <> :ghgAnalysisType')
          .orWhere('lp.analysisEndTime >= :ghgChargingStartDate')
      )
    )
    .setParameters({
      ghgAnalysisType: GHG_ANALYSIS_TYPE,
      ghgChargingStartDate: GHG_CHARGING_START_DATE,
    })
    .groupBy('lp.analysisType')
    .getRawMany();

  // Create a map of actual usage data
  const usageMap = new Map(
    results.map((result) => [
      result.analysis_type,
      {
        hectares_analyzed: parseFloat(result.total_area_analyzed) || 0,
        max_area_analyzed: parseFloat(result.max_area_analyzed) || 0,
        lists_analyzed: parseInt(result.total_lists_analyzed) || 0,
        locations_analyzed: parseInt(result.total_locations_analyzed) || 0,
        analysis_type: result.analysis_type,
      },
    ])
  );

  // Merge with all possible analysis types, filling in zeros where no data exists
  return ALL_ANALYSIS_TYPES.map(({ type }) => {
    const usage = usageMap.get(type);
    return (
      usage || {
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
        analysis_type: type,
      }
    );
  }).sort((a, b) => {
    // Maintain the defined order
    const orderA = ALL_ANALYSIS_TYPES.find((t) => t.type === a.analysis_type)?.order || 999;
    const orderB = ALL_ANALYSIS_TYPES.find((t) => t.type === b.analysis_type)?.order || 999;
    return orderA - orderB;
  });
}
