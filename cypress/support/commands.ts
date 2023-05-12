/// <reference types="cypress" />
//
// See https://docs.cypress.io/api/cypress-api/custom-commands

// login using desktop header and verify MFA token
Cypress.Commands.add('login', (email: string, password: string, verifyToken: string) => {
  cy.get('[data-cy="desktopHeader"]').then((desktopHeader) => {
    cy.wrap(desktopHeader).find('[data-cy="loginNav"]').click();
    cy.wrap(desktopHeader).find('[data-cy="username"]').type('dt_test1@example.com');
    cy.wrap(desktopHeader).find('[data-cy="password"]').type('unsafe');
    cy.wrap(desktopHeader).find('[data-cy="loginButton"]').click();
  });

  cy.get('[data-cy="verifyToken"]').type(verifyToken);
  cy.get('[data-cy="verifyButton"]').click();
});
