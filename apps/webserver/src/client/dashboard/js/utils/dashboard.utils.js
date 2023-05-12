import dictionary from './dictionary';

/**
 * Calculates the number of alerts for the dashboard
 * @param {Object} geoJSON The GeoJSON for the list
 * @param {Object} failedGeoJSON The GeoJSON containing the failed locations
 * @param {String} selectedAlert The type of alerts selected (either `GLAD` or `VIIRS`)
 * @param {Object} filteredLocationGeoJSON A GeoJSON containing filtered locations based on the selectedAlert
 * @param {Object} filteredDissolvedGeoJSON A GeoJSON containing the dissolved list
 * @param {Array}  locationIdsWithAlerts A array of location IDs that have alerts
 * @returns {Object} Returns an object containing the resulting number of alerts for a given list processed in the dashboard
 */
export const calculateAlerts = (
  geoJSON,
  failedGeoJSON,
  selectedAlert,
  filteredLocationGeoJSON,
  filteredDissolvedGeoJSON
) => {
  const selectedProperty = dictionary.alertType_featureTimeframeProperty[selectedAlert];
  const selectedAlertsProperty = dictionary.alertType_featureCoverageProperty[selectedAlert];
  const totalLocations = geoJSON.features.length + failedGeoJSON.features.length;
  let locationIdsWithAlerts = [];
  let locationIdsWithoutAlerts = [];

  let locationsWithinAlerts = 0;
  let locationsWithAlerts = 0;

  if (selectedAlert === 'GLAD') {
    filteredLocationGeoJSON.forEach((feature) => {
      locationsWithinAlerts += feature.properties[selectedAlertsProperty] ? 1 : 0;
      if (feature.properties[selectedAlertsProperty] && feature.properties.gladTimeframe.length > 0) {
        locationsWithAlerts += 1;
        locationIdsWithAlerts.push(feature.properties.location_id);
      } else {
        locationIdsWithoutAlerts.push(feature.properties.location_id);
      }
    });

    const percentageWithAlerts = (locationsWithAlerts / locationsWithinAlerts) * 100;
    const totalAlerts = filteredDissolvedGeoJSON.features
      .map((f) => {
        return f.properties.gladTimeframe;
      })
      .flat()
      .reduce((acc, curr) => acc + curr.count, 0);

    return {
      totalLocations,
      totalAlerts,
      percentageAlerts: percentageWithAlerts,
      withAlerts: locationsWithAlerts,
      withinAlerts: locationsWithinAlerts,
      locationIdsWithAlerts,
      locationIdsWithoutAlerts,
    };
  } else {
    //FIRE Alerts
    //TODO: Refactor to make less round trips and array iterations, perhaps one for loop would be enough
    const locationsWithAlertsCount = filteredLocationGeoJSON.filter(
      (f) => Object.values(f.properties.fireTimeframe).length > 0
    );
    locationIdsWithAlerts = locationsWithAlertsCount.map((f) => f.properties.location_id);
    const locationsWithoutAlertsCount = filteredLocationGeoJSON.filter(
      (f) => Object.values(f.properties.fireTimeframe).length === 0
    );
    locationIdsWithoutAlerts = locationsWithoutAlertsCount.map((f) => f.properties.location_id);
    const percentageWithAlerts = (locationsWithAlertsCount.length / totalLocations) * 100;

    const totalAlerts = filteredDissolvedGeoJSON.features.reduce((acc, feature) => {
      const selectedData = feature.properties.fireTimeframe;
      const featureAlertTotal = Object.values(selectedData)
        .map((arr) => arr.reduce((total, element) => total + element.count, 0))
        .reduce((featureTotal, el) => featureTotal + el, 0);
      return acc + featureAlertTotal;
    }, 0);

    locationsWithinAlerts = totalLocations;
    return {
      totalLocations,
      totalAlerts,
      percentageAlerts: percentageWithAlerts,
      withAlerts: locationsWithAlertsCount.length,
      withinAlerts: locationsWithinAlerts,
      locationIdsWithAlerts,
      locationIdsWithoutAlerts,
    };
  }
};
