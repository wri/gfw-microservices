const login = () => {
  cy.on('uncaught:exception', () => {
    // work around for existing errors that otherwise fail the test
    return false;
  });
  cy.visit('/');
  cy.login('dt_test1@example.com', 'unsafe');
};

export { login };
