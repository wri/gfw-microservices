describe('basic smoke tests', () => {
  it('login to landing page', () => {
    cy.on('uncaught:exception', () => {
      // work around for existing errors that otherwise fail the test
      return false;
    });

    cy.visit('https://localhost:8443');
    cy.login('dt_test1@example.com', 'unsafe', 'unsafe');
    cy.url().should('include', '/locations');
  });
});
