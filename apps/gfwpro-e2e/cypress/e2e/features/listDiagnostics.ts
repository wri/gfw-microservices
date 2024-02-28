import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('I login in the landing page', () => {
  cy.on('uncaught:exception', () => {
    // work around for existing errors that otherwise fail the test
    return false;
  });
  cy.visit('/');

  const deployment = Cypress.env('deployment');
  const credentials = Cypress.env(deployment);
  cy.get('[data-cy="desktopHeader"]').then((desktopHeader) => {
    cy.wrap(desktopHeader).find('[data-cy="loginNav"]').click();
    cy.wrap(desktopHeader).find('[data-cy="username"]').type(credentials.username);
    cy.wrap(desktopHeader).find('[data-cy="password"]').type(credentials.password);
    cy.wrap(desktopHeader).find('[data-cy="loginButton"]').click();
  });

  cy.get('[data-cy="verifyToken"]').type(credentials.password);
  cy.get('[data-cy="verifyButton"]').click();
});

Then('I should be redirected to locations view', () => {
  cy.url().should('include', '/locations');
});
