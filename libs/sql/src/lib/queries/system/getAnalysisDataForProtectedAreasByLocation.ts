export const getAnalysisDataForProtectedAreasByLocation = `SELECT @list_id AS list_id
, L.[id] AS id_in_list, L.[Location Name], L.[Latitude], L.[Longitude], L.[Country], L.[State], L.[Sub State]
, L.[Size], L.[IUCN CAT], L.[Designation Type], L.[Designation], L.[Location Classification]
, L.[gadmid], L.[globalid], L.[location_id] AS location_id_in_list
, A.*
FROM dbo.[list-protectedAreas] L
LEFT JOIN dbo.[analysis-protectedAreas] A ON A.location_id = L.location_id
WHERE L.[location_id] = @location_id`;
