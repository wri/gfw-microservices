const listIdFromListName = {
  'AAT Argentina Points Generic': 2,
  'AAT West Africa Cocoa Generic': 3,
  'AAT Indonesia Palm Oil Generic': 4,
  'AAT Argentina Polygons Generic': 5,
};

const List = {
  viewDiagnostics() {
    cy.get('[data-cy="list-diagnostics"]').click();
  },
};

const withName = (name: string) => {
  cy.visit(`/list-details?id=${listIdFromListName[name]}`);
  return List;
};

export { withName, listIdFromListName };
