const login = () => {
  cy.on('uncaught:exception', () => {
    // work around for existing errors that otherwise fail the test
    return false;
  });
  cy.visit('/');
  const deployment = Cypress.env('deployment');
  const credentials = Cypress.env(deployment);
  cy.login(credentials.username, credentials.password, credentials.password);
};

export { login };
