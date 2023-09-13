const path = require('path');
const { getAFIAnalysisForListId } = require(path.resolve(
  './config/publicutils/analysisManager.utils'
));
const { calculateNegligibleRiskStats } = require('../utils/afiFunctions');

/**
 * @summary handles afi analysis endpoint
 * @param {Object} req Express Request
 * @param {Object} res Express Respond
 */
module.exports = async (req, res) => {
  const { listId } = req.params;

  try {
    const afiAnalysisForCurrentList = await getAFIAnalysisForListId(req, listId);
    const negligibleRiskStats = calculateNegligibleRiskStats(afiAnalysisForCurrentList);

    return res.status(200).send({
      regionalInfo: afiAnalysisForCurrentList,
      negligibleRiskStats,
    });
  } catch (error) {
    console.error('AFI Deforestation KPIs failed on server', error);
    res.status(500).send(error);
  }
};
