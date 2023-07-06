const listIdFromListName = {
  'Argentina Jujuy OTBN': 5439,
};

const List = {
  viewDiagnostics() {
    cy.get('[data-cy="list-diagnostics"]').click();
  },
};

const withName = (name: string) => {
  cy.visit(`/locations?id=${listIdFromListName[name]}`);
  return List;
};

export { withName };
