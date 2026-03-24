import { Brackets } from 'typeorm';
import { ClientStoreConnection } from '../util';
import { ListsProcessing } from '../entity/organization';
import { ChargeRate, systemEntities } from '../entity/system';
import { OrganizationAnalysisUsageByAnalysisType as OrganizationAnalysisUsageResponseByAnalysisType } from '../queries/organization/getOrganizationAnalysisUsageByAnalysisType';

interface GetAccountAnalysisUsageByAnalysisType {
  startDate: string;
  endDate: string;
  orgDbName: string;
}

/**
 * Possible duplicate
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

// Tokenization effective date - no token charges before this date (GPV-5226)
const TOKENIZATION_EFFECTIVE_DATE = new Date('2025-11-22T00:00:00.000Z');

/**
 * Interface for tokenization data returned from the raw SQL query
 */
interface TokenizationResult {
  analysis_type: string;
  total_area_analyzed: string | number;
  total_location_tokens: string | number;
  total_list_tokens: string | number;
  location_rate: string | number | null;
  list_rate: string | number | null;
  effective_rate_date: Date | null;
}

/**
 * Default tokenization values for analysis types without applicable rates
 */
const DEFAULT_TOKENIZATION_VALUES = {
  location_rate: null,
  list_rate: null,
  total_location_tokens: 0,
  total_list_tokens: 0,
  total_tokens: 0,
  effective_rate_date: null,
};

/**
 * Fetches all charge rates from the system database
 * Used for calculating token usage based on analysis_end_time
 */
async function getChargeRates(): Promise<ChargeRate[]> {
  const clientStoreConnection = new ClientStoreConnection();
  const systemConnection = await clientStoreConnection.getConnection('gfwpro', systemEntities);
  const chargeRateRepository = systemConnection.getRepository(ChargeRate);

  return chargeRateRepository.find({
    order: {
      analysisType: 'ASC',
      effectiveDate: 'DESC',
    },
  });
}

/**
 * Finds the applicable charge rate for a given analysis type and date
 * Returns the most recent rate where effective_date <= analysis_end_time
 */
function findApplicableRate(
  chargeRates: ChargeRate[],
  analysisType: string,
  analysisEndTime: Date
): ChargeRate | null {
  // Filter rates for this analysis type that are effective at or before the analysis end time
  const applicableRates = chargeRates.filter(
    (rate) => rate.analysisType === analysisType && rate.effectiveDate <= analysisEndTime
  );

  // Return the most recent applicable rate (already sorted by effectiveDate DESC)
  return applicableRates.length > 0 ? applicableRates[0] : null;
}

/**
 * Calculates token usage with ChargeRate join using raw SQL
 * TypeORM query builder does not support cross-database joins (ListsProcessing in org DB,
 * ChargeRate in system DB). The raw query uses a correlated subquery to find the
 * most recent applicable rate at analysis_end_time.
 */
async function calculateTokenUsage(
  orgDbName: string,
  startDate: string,
  endDate: string
): Promise<Map<string, TokenizationResult>> {
  const clientStoreConnection = new ClientStoreConnection();
  const connection = await clientStoreConnection.getConnection(orgDbName);
  const systemDbName = process.env.MSSQL_DATABASE || 'gfwpro';

  const startDateTime = new Date(`${startDate}T00:00:00.000Z`);
  const endDateTime = new Date(`${endDate}T23:59:59.997Z`);

  const tokenizationQuery = `
    SELECT
      q0.analysis_type,
      SUM(q0.area_analyzed_locations_ha) as total_area_analyzed,
      SUM(ISNULL(q0.locations_analyzed, 0) * ISNULL(q0.location_rate, 0)) as total_location_tokens,
      SUM(ISNULL(q0.list_rate, 0)) as total_list_tokens,
      MAX(q0.location_rate) as location_rate,
      MAX(q0.list_rate) as list_rate,
      MAX(q0.effective_date) as effective_rate_date
    FROM (
      SELECT
        lp.analysis_type,
        lp.area_analyzed_locations_ha,
        lp.locations_analyzed,
        cr.effective_date,
        cr.location_rate,
        cr.list_rate
      FROM [dbo].[ListsProcessing] lp
      LEFT JOIN [${systemDbName}].[dbo].[ChargeRate] cr ON
        lp.analysis_type = cr.analysis_type
        AND cr.effective_date = (
          SELECT MAX(cr2.effective_date)
          FROM [${systemDbName}].[dbo].[ChargeRate] cr2
          WHERE cr2.analysis_type = lp.analysis_type
          AND cr2.effective_date <= lp.analysis_end_time
        )
      WHERE lp.analysis_end_time >= @0
        AND lp.analysis_end_time <= @1
        AND lp.user_id IS NOT NULL
    ) q0
    GROUP BY q0.analysis_type
  `;

  const results = await connection.query(tokenizationQuery, [startDateTime, endDateTime]);

  const tokenizationMap = new Map<string, TokenizationResult>();
  for (const result of results) {
    tokenizationMap.set(result.analysis_type, {
      analysis_type: result.analysis_type,
      total_area_analyzed: result.total_area_analyzed,
      total_location_tokens: result.total_location_tokens,
      total_list_tokens: result.total_list_tokens,
      location_rate: result.location_rate,
      list_rate: result.list_rate,
      effective_rate_date: result.effective_rate_date,
    });
  }

  return tokenizationMap;
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

  const [basicResults, tokenizationMap] = await Promise.all([
    // Original query for basic usage data using TypeORM query builder
    listsProcessingRepository
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
      .getRawMany(),
    // New tokenization query
    calculateTokenUsage(orgDbName, startDate, endDate),
  ]);

  // Create a map of actual usage data with tokenization
  const usageMap = new Map(
    basicResults.map((result) => {
      const tokenData = tokenizationMap.get(result.analysis_type);

      // Calculate total tokens if rates are available
      const locationTokens = tokenData
        ? parseFloat(String(tokenData.total_location_tokens)) || 0
        : 0;
      const listTokens = tokenData ? parseFloat(String(tokenData.total_list_tokens)) || 0 : 0;
      const hasTokenData =
        tokenData && (tokenData.location_rate !== null || tokenData.list_rate !== null);

      return [
        result.analysis_type,
        {
          hectares_analyzed: parseFloat(result.total_area_analyzed) || 0,
          max_area_analyzed: parseFloat(result.max_area_analyzed) || 0,
          lists_analyzed: parseInt(result.total_lists_analyzed) || 0,
          locations_analyzed: parseInt(result.total_locations_analyzed) || 0,
          analysis_type: result.analysis_type,
          // Tokenization fields
          location_rate: hasTokenData ? parseFloat(String(tokenData.location_rate)) || null : null,
          list_rate: hasTokenData ? parseFloat(String(tokenData.list_rate)) || null : null,
          total_location_tokens: hasTokenData ? locationTokens : 0,
          total_list_tokens: hasTokenData ? listTokens : 0,
          total_tokens: hasTokenData ? locationTokens + listTokens : 0,
          effective_rate_date: tokenData?.effective_rate_date || null,
        },
      ];
    })
  );

  // Merge with all possible analysis types, filling in zeros/nulls where no data exists
  return ALL_ANALYSIS_TYPES.map(({ type }) => {
    const usage = usageMap.get(type);
    return (
      usage || {
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
        analysis_type: type,
        ...DEFAULT_TOKENIZATION_VALUES,
      }
    );
  }).sort((a, b) => {
    // Maintain the defined order
    const orderA = ALL_ANALYSIS_TYPES.find((t) => t.type === a.analysis_type)?.order || 999;
    const orderB = ALL_ANALYSIS_TYPES.find((t) => t.type === b.analysis_type)?.order || 999;
    return orderA - orderB;
  });
}

// Export helper functions for testing
export { getChargeRates, findApplicableRate, calculateTokenUsage, TOKENIZATION_EFFECTIVE_DATE };
