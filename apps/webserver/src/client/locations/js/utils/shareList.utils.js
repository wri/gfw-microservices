export const ADMIN_ACCESS_LEVEL = 1;

export const getAccessLevelTitle = {
  1: 'Administrator',
  2: 'Editor',
  3: 'Viewer',
};

export const normalizeComapnyData = (company) => {
  company['tag'] = company.contry;
  company['label'] = `${company.name}`.toLowerCase();
  return company;
};

export const normalizeShaledLists = (sharedList) => {
  return sharedList.map((list) => Object.assign(list, { is_shared: true }));
};

export const nameContainsText = (name, text) => {
  if (!text) {
    return true;
  }

  return name.toLowerCase().indexOf(text.toLowerCase()) >= 0;
};
