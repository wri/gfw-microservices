export const sharedColumnText = (list) => {
  if (list?.sharedWith) {
    return list.sharedWith;
  }

  return list?.sharedList?.length > 1
    ? `${list?.sharedList[0]}, ${list?.sharedList.length - 1}+`
    : list?.sharedList[0];
};
