import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('I login in the landing page', () => {
  cy.on('uncaught:exception', () => {
    // work around for existing errors that otherwise fail the test
    return false;
  });
  cy.visit('https://localhost:8443');

  cy.get('[data-cy="desktopHeader"]').then((desktopHeader) => {
    cy.wrap(desktopHeader).find('[data-cy="loginNav"]').click();
    cy.wrap(desktopHeader).find('[data-cy="username"]').type('dt_test1@example.com');
    cy.wrap(desktopHeader).find('[data-cy="password"]').type('unsafe');
    cy.wrap(desktopHeader).find('[data-cy="loginButton"]').click();
  });

  cy.get('[data-cy="verifyToken"]').type('unsafe');
  cy.get('[data-cy="verifyButton"]').click();
});

Then('I should be redirected to locations view', () => {
  cy.url().should('include', '/locations');
});
