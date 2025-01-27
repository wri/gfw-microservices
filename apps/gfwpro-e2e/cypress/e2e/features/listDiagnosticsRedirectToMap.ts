import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import DiagnosticsPage from '../../pages/diagnosticsPage';

describe('List diagnostics', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  const diagnosticsPage = new DiagnosticsPage();

  Given('I am logged in', () => {
    cy.loginUI();
  });

  When('I navigate to locations and select a user list', () => {
    cy.visit('/locations');
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
  });

  When('I navigate to locations and select a GFW list', () => {
    cy.visit('/locations');
    locationsPage.clickOnLocationsList('Palm Oil Mills');
  });

  When('I click on the List Diagnostic button', () => {
    listDetailsPage.clickOnListDiagnosticsBtn();
  });

  When('I click on the map', () => {
    diagnosticsPage.clickOnDiagnosticMap();
  });

  When('I change to the post 2000 Forest Change diagnostics', () => {
    diagnosticsPage.changeDiagnostics('Post-2000 Forest Change');
  });

  Then('I should be redirected to the map page and view the GFW list loaded on the map', () => {
    cy.location('href').should('include', '/map');
  });

  Then('I should be redirected to the map page and view the user list loaded on the map', () => {
    cy.location('href').should('include', '/map');
  });
});
