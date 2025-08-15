export const getAdministrativeAreasDataByLocation = `SELECT [Location Name],[Country],[State],[Sub State],[Latitude],[Longitude],[Location Classification],[Size],[gadmid],[location_id] FROM
  [list-administrativeAreas41] WHERE [location_id] = @location_id`;
