import { Brackets } from 'typeorm';
import { ClientStoreConnection } from '../util';
import { ListsProcessing } from '../entity/organization';
import { OrganizationAnalysisUsageByAnalysisType as OrganizationAnalysisUsageResponseByAnalysisType } from '../queries/organization/getOrganizationAnalysisUsageByAnalysisType';

interface GetAccountAnalysisUsageByAnalysisType {
  startDate: string;
  endDate: string;
  orgDbName: string;
}

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
      `ISNULL(SUM(CASE WHEN lp.analysisType = :ghgAnalysisType THEN 0 ELSE lp.locationsAnalyzed END), 0)`,
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

  // Transform results to match expected format
  return results.map((result) => ({
    hectares_analyzed: parseFloat(result.total_area_analyzed) || 0,
    max_area_analyzed: parseFloat(result.max_area_analyzed) || 0,
    lists_analyzed: parseInt(result.total_lists_analyzed) || 0,
    locations_analyzed: parseInt(result.total_locations_analyzed) || 0,
    analysis_type: result.analysis_type,
  }));
}
