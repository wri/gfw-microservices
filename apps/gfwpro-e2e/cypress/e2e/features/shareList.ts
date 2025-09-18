import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import BasePage from '../../pages/basePage';
import LocationsPage from '../../pages/locationsPage';

describe('Upload location', () => {
  const basePage = new BasePage();
  const locationsPage = new LocationsPage();
  const sharedList = ['AAT ShareList'];
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

  When('I share a list with users', () => {
    locationsPage.clickOnMoreOptionsList(sharedList[0]);
    locationsPage.clickShareBtn();
    locationsPage.selectUserToShareList(credentials.viewer);
    locationsPage.selectUserToShareList(credentials.editor);
  });

  When('I stop sharing a list with users', () => {
    locationsPage.clickOnMoreOptionsList(sharedList[0]);
    locationsPage.clickShareBtn();
    locationsPage.clickStopSharingBtn();
    locationsPage.clickOnConfirmActionBtn();
  });

  Then('I should be redirected to locations view', () => {
    cy.url().should('include', '/locations');
  });

  Then('I should see the users added to the shared list', () => {
    cy.get('.gfw-button.btn-remove').should('have.length', 2);
  });

  Then('I should not see the users added to the shared list', () => {
    cy.get('.gfw-button.btn-remove').should('have.length', 2);
  });

  Then('I should see the shared list in the locations page', () => {
    locationsPage.verifyLists(sharedList, true);
  });

  Then('I should not see the shared list in the locations page', () => {
    locationsPage.verifyLists(sharedList, false);
  });
});
