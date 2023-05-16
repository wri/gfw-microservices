// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    login(email: string, password: string, verifyToken: string): void;
  }
}

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

//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
