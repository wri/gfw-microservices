const getAllLists = `SELECT  L.*, LL.large_list_id
FROM Lists L
LEFT JOIN LargeLists LL ON L.id=LL.list_id
ORDER BY list_name`;

export { getAllLists };
