import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import DiagnosticsPage from '../../pages/diagnosticsPage';

describe('List diagnostics', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  const diagnosticsPage = new DiagnosticsPage();

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

  When('I navigate to a list details page', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
  });

  When('I click on list diagnostic button', () => {
    listDetailsPage.clickOnListDiagnosticsBtn();
  });

  Then('I should be redirected to diagnostic view', () => {
    cy.url().should('include', '/diagnostics?listId=2');
    cy.get('.diagnostics-menu-bar').scrollIntoView();
    expect(diagnosticsPage.elements.reportBtn().should('be.visible'));
    expect(diagnosticsPage.elements.downloadBtn().should('be.visible'));
    expect(diagnosticsPage.elements.diagnosticsMap().should('be.visible'));
    expect(diagnosticsPage.elements.headerLocationCount().should('have.text', '787 locations'));
  });
});
