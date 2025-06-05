export const getUserLists = `
  SELECT L.*, LL.large_list_id
  FROM Lists L
  LEFT JOIN LargeLists LL ON L.id=LL.list_id
  WHERE user_id = @user_id
  AND (@list_id IS NULL OR L.id = @list_id)
  ORDER BY list_name;
`;
