const path = require('path');
const {
  getAFIAnalysisForListId,
  getAFINegligibleStatsForListId,
  formatNumber,
} = require(path.resolve('./config/publicutils/analysisManager.utils'));
const { formatNegligibleRiskStatForChart } = require('../utils/afiFunctions');

/**
 * @summary handles afi analysis endpoint
 * @param {Object} req Express Request
 * @param {Object} res Express Respond
 */
module.exports = async (req, res) => {
  const { listId } = req.params;

  try {
    const afiAnalysisForCurrentList = await getAFIAnalysisForListId(req, listId);
    const formattedAfiAnalysisForCurrentList = afiAnalysisForCurrentList.map((item) =>
      formatNumber(item)
    );

    const afiNegligibleStatsForCurrentList = await getAFINegligibleStatsForListId(req, listId);
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
