export const getUserLists = `
  SELECT L.*, LL.large_list_id,
   JSON_QUERY((
        SELECT
            las.[options],
            las.AnalysisID as analysisId,
            las.bundle_creation_time,
            las.ErrorInfo,
            las.expiration_time,
            las.s3_url,
            las.Status as status,
            las.UpdateTime
        FROM ListsAnalysisStatus las
        WHERE las.ListID = LL.list_id
        FOR JSON PATH
    )) AS listAnalysesStatus
  FROM Lists L
  LEFT JOIN LargeLists LL ON L.id=LL.list_id
  WHERE user_id = @user_id
  AND (@list_id IS NULL OR L.id = @list_id)
  ORDER BY list_name;
`;
