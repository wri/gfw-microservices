import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor';

import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import DiagnosticsPage from '../../pages/diagnosticsPage';

describe('Alerts page', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  const diagnosticPage = new DiagnosticsPage();
  Given('I login to the landing page', () => {
    cy.loginUI();
    cy.visit('/locations');
  });

  When('I navigate to a list details page from the Argentina list', () => {
    locationsPage.clickOnLocationsList('Test Deforestation Arg');
  });

  When('I navigate to a list details page from the Colombia list', () => {
    locationsPage.clickOnLocationsList('Test Deforestation Col');
  });

  When('I navigate to a diagnostics page', () => {
    listDetailsPage.clickOnListDiagnosticsBtn();
  });

  Then('I should be able to control the visibility of the charts for Argentina', () => {
    diagnosticPage.verifyChartArgentina();
  });

  Then('I should be able to control the visibility of the charts for Colombia', () => {
    diagnosticPage.verifyChartColombia();
  });
});
