import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import DiagnosticsPage from '../../pages/diagnosticsPage';
import * as User from '../../app-api/User';
import MapPage from '../../pages/mapPage';

describe('List diagnostics', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  const diagnosticsPage = new DiagnosticsPage();
  const mapPage = new MapPage();

  Given('I am logged in', () => {
    User.login();
  });

  When('I navigate to locations and select a list', () => {
    cy.visit('/locations');
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
  });

  When('I navigate to locations and select the GFW list', () => {
    cy.visit('/locations');
    locationsPage.clickOnLocationsList('Palm Oil Mills');
  });

  When('I choose a location and click List Diagnostic', () => {
    listDetailsPage.selectCheckBoxes([1]);
    listDetailsPage.clickOnListDiagnosticsBtn();
  });

  When('I choose multiple locations and click List Diagnostic', () => {
    listDetailsPage.selectCheckBoxes([1, 2]);
    listDetailsPage.clickOnListDiagnosticsBtn();
  });

  When('I choose all locations and click List Diagnostic', () => {
    listDetailsPage.checkOnCheckBoxSelectAll();
    listDetailsPage.clickOnListDiagnosticsBtn();
  });

  When('I click on the map', () => {
    diagnosticsPage.clickOnDiagnosticMap();
  });

  Then('I should be redirected to map with the selected location from GFW list', () => {
    cy.url().should('include', '/map');
    mapPage.elements
      .titleList('2,154 - Palm Oil Mills')
      .should('have.text', '2,154 - Palm Oil Mills');
  });

  Then('I should be redirected to map with the selected location from the list', () => {
    cy.url().should('include', '/map');
    mapPage.elements
      .titleList('787 - AAT Argentina Points Generic')
      .should('have.text', '787 - AAT Argentina Points Generic');
  });
});
