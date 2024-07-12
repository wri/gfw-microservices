const path = require('path');
const {
  getAFIAnalysisForListId,
  getAFINegligibleStatsForListId,
  formatNumber,
} = require(path.resolve('./config/publicutils/analysisManager.utils'));
const { formatNegligibleRiskStatForChart } = require('../utils/afiFunctions');
import { z } from 'zod';

export const AfiValidationSchema = z.object({
  listId: z.coerce.number({
    required_error: 'Missing listId',
  }),
  locationId: z.optional(z.coerce.number()).catch(undefined),
});

/**
 * @summary handles afi analysis endpoint
 * @param {Object} req Express Request
 * @param {Object} res Express Respond
 */
export default async (req, res) => {
  try {
    const afiValidationResults = AfiValidationSchema.parse({
      ...req.params,
      ...req.query,
    });
    const { listId, locationId } = afiValidationResults;
    const afiAnalysisForCurrentList = await getAFIAnalysisForListId(req, listId, locationId);
    const formattedAfiAnalysisForCurrentList = afiAnalysisForCurrentList.map((item) =>
      formatNumber(item)
    );

    const afiNegligibleStatsForCurrentList = await getAFINegligibleStatsForListId(
      req,
      listId,
      locationId
    );
    const negligibleRiskStats = formatNegligibleRiskStatForChart(afiNegligibleStatsForCurrentList);

    return res.status(200).send({
      regionalInfo: formattedAfiAnalysisForCurrentList,
      negligibleRiskStats,
    });
  } catch (error) {
    console.error('AFI Deforestation KPIs failed on server', error);
    res.status(500).send(error);
  }
};
