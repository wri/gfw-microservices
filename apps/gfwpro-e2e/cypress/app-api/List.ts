const listIdFromListName = {
  'Argentina Jujuy OTBN': 5439,
  'Southest Asia': 5528,
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
