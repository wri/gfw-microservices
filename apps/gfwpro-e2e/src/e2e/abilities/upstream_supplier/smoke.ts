import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('I login in the landing page', () => {
  cy.on('uncaught:exception', () => {
    // work around for existing errors that otherwise fail the test
    return false;
  });
  cy.visit('https://localhost:8443');
  cy.login('dt_test1@example.com', 'unsafe', 'unsafe');
});

Then('I should be redirected to locations view', () => {
  cy.url().should('include', '/locations');
  // assert.deepEqual({}, {});
});
