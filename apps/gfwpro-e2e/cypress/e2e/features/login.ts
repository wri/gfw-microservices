import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import BasePage from '../../pages/basePage';

describe('Upload location', () => {
  const basePage = new BasePage();

  const deployment = Cypress.env('deployment');
  const credentials = Cypress.env(deployment);

  When('I login as admin', () => {
    cy.on('uncaught:exception', () => {
      // work around for existing errors that otherwise fail the test
      return false;
    });
    cy.visit('/');

    basePage.clickOnLoginNav();
    basePage.fillUsername(credentials.username);
    basePage.fillPassword(credentials.password);
    basePage.clickOnLoginBtn();
    basePage.fillToken(credentials.password);
    basePage.clickOnVerifyBtn();
  });

  When('I login as viewer', () => {
    cy.on('uncaught:exception', () => {
      // work around for existing errors that otherwise fail the test
      return false;
    });
    cy.visit('/');

    basePage.clickOnLoginNav();
    basePage.fillUsername(credentials.viewer);
    basePage.fillPassword(credentials.password);
    basePage.clickOnLoginBtn();
    basePage.fillToken(credentials.password);
    basePage.clickOnVerifyBtn();
  });

  When('I login as editor', () => {
    cy.on('uncaught:exception', () => {
      // work around for existing errors that otherwise fail the test
      return false;
    });
    cy.visit('/');

    basePage.clickOnLoginNav();
    basePage.fillUsername(credentials.editor);
    basePage.fillPassword(credentials.password);
    basePage.clickOnLoginBtn();
    basePage.fillToken(credentials.password);
    basePage.clickOnVerifyBtn();
  });

  Then('I should be redirected to locations view', () => {
    cy.url().should('include', '/locations');
  });
});