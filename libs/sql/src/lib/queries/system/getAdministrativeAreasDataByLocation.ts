export const getAdministrativeAreasDataByLocation = `SELECT [id],[Location Name],[Country],[State],[Sub State],[Latitude],[Longitude],[Location Classification],[Size],[gadmid],[location_id] FROM
  [list-administrativeAreas] WHERE [location_id] = @location_id`;
