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

  Given('I login in the landing page', () => {
    User.login();
    cy.visit('/locations');
  });

  When('I navigate to a list details page containing a single location', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
    listDetailsPage.selectCheckBoxes([1]);
  });

  When('I navigate to a GFW list details page containing a single location', () => {
    locationsPage.clickOnLocationsList('Palm Oil Mills');
    listDetailsPage.selectCheckBoxes([1]);
  });

  When('I navigate to a list details page containing multiple locations', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
    listDetailsPage.selectCheckBoxes([1, 2]);
  });

  When('I navigate to a GFW list details page containing multiple locations', () => {
    locationsPage.clickOnLocationsList('Palm Oil Mills');
    listDetailsPage.selectCheckBoxes([1, 2]);
  });

  When('I navigate to a full list details page', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
    listDetailsPage.clickOnFullListMapBtn();
  });

  When('I navigate to a GFW full list details page', () => {
    locationsPage.clickOnLocationsList('Palm Oil Mills');
    listDetailsPage.clickOnFullListMapBtn();
  });

  When('I click on the list diagnostics button', () => {
    listDetailsPage.clickOnListDiagnosticsBtn();
  });

  Then('I should be redirected to the map view and verify the single location', () => {
    diagnosticsPage.clickOnDiagnosticMap();
    cy.url().should('include', '/map');
    mapPage.elements
      .titleList('787 - AAT Argentina Points Generic')
      .should('have.text', '787 - AAT Argentina Points Generic');
  });

  Then('I should be redirected to the map view in GFW and verify the single location', () => {
    diagnosticsPage.clickOnDiagnosticMap();
    cy.url().should('include', '/map');
    mapPage.elements
      .titleList('2,154 - Palm Oil Mills')
      .should('have.text', '2,154 - Palm Oil Mills');
  });

  Then('I should be redirected to the map view and verify the multiple locations', () => {
    diagnosticsPage.clickOnDiagnosticMap();
    cy.url().should('include', '/map');
    mapPage.elements
      .titleList('787 - AAT Argentina Points Generic')
      .should('have.text', '787 - AAT Argentina Points Generic');
  });

  Then('I should be redirected to the map view in GFW and verify the multiple locations', () => {
    diagnosticsPage.clickOnDiagnosticMap();
    cy.url().should('include', '/map');
    mapPage.elements
      .titleList('2,154 - Palm Oil Mills')
      .should('have.text', '2,154 - Palm Oil Mills');
  });

  Then('I should be redirected to the map view and verify the full list locations', () => {
    cy.url().should('include', '/map');
    mapPage.elements
      .titleList('787 - AAT Argentina Points Generic')
      .should('have.text', '787 - AAT Argentina Points Generic');
  });

  Then('I should be redirected to the map view in GFW and verify the full list locations', () => {
    cy.url().should('include', '/map');
    mapPage.elements
      .titleList('2,154 - Palm Oil Mills')
      .should('have.text', '2,154 - Palm Oil Mills');
  });
});
