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
    login(email: string, password: string, verifyToken?: string): void;
  }
}

// login using desktop header and verify MFA token
Cypress.Commands.add('login', (email: string, password: string, verifyToken = 'unsafe') => {
  cy.request({
    method: 'POST',
    url: '/auth/signinpost',
    body: {
      username: email,
      password: password,
    },
  });

  cy.request({
    method: 'POST',
    url: '/auth/verifyLogin',
    form: true,
    body: {
      tokenID: verifyToken,
    },
  });
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
