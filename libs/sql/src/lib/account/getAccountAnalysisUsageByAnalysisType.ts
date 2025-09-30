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
  const clientStoreConnection = new ClientStoreConnection();
  const connection = await clientStoreConnection.getConnection(orgDbName);
  const listsProcessingRepository = connection.getRepository(ListsProcessing);

  const startDateTime = new Date(`${startDate}T00:00:00.000Z`);
  const endDateTime = new Date(`${endDate}T23:59:59.997Z`);

  // Use TypeORM query builder to match the exact SQL query structure
  const results = await listsProcessingRepository
    .createQueryBuilder('lp')
    .select([
      'ISNULL(SUM(lp.areaAnalyzedLocationsHa), 0) as total_area_analyzed',
      'COUNT(DISTINCT lp.listId) as total_lists_analyzed',
      'ISNULL(SUM(lp.locationsAnalyzed), 0) as total_locations_analyzed',
      'lp.analysisType as analysis_type',
    ])
    .where('lp.analysisEndTime >= :startDateTime', { startDateTime })
    .andWhere('lp.analysisEndTime <= :endDateTime', { endDateTime })
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
