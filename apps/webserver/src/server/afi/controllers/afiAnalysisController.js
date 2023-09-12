
const path = require('path');
const ListManager = require(path.resolve('./config/publicutils/listManager.utils'));
const { getAFIAnalysisForListId } = require(path.resolve(
  './config/publicutils/analysisManager.utils'
));
const {
  calculateNegligibleRiskStats,
  determineNegligibleRiskForLocation,
  afiAnalysisFilters,
} = require('../utils/afiFunctions');

/**
 * @summary handles afi analysis endpoint
 * @param {Object} req Express Request
 * @param {Object} res Express Respond
 */
module.exports = async (req, res) => {
  const { listId } = req.params;

  try {
    const AFIAnalysisForCurrentList = await getAFIAnalysisForListId(req, listId);
    const locationColumns = `Country,State,Sub State,location_id`;
    const listLocations = await ListManager.getListLocationsNoGeom(req, listId, locationColumns);

    const regionalInfo = AFIAnalysisForCurrentList.filter(afiAnalysisFilters).map((record) => {
      const location = listLocations.find((loc) => loc.location_id === record.location_id);

      return {
        id: record.location_id,
        country: location['Country'],
        subState: location['Sub State'],
        state: location['State'],
        coverageHA: record.natural_land_area,
        naturalForestLossHA: record.natural_land_deforested_area,
        totalAreaHa: record.total_area_ha,
        negligibleRisk: determineNegligibleRiskForLocation(record.negligible_risk),
      };
    });

    const negligibleRiskStats = calculateNegligibleRiskStats(regionalInfo);

    return res.status(200).send({
      regionalInfo,
      negligibleRiskStats,
    });
  } catch (error) {
    console.error('AFI Deforestation KPIs failed on server', error);
  }
}