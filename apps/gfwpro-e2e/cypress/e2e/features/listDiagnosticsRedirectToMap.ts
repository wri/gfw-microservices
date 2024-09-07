import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
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

  When('I login in the landing page', () => {
    User.login();
    cy.visit('/locations');
  });

  When('I navigate to a sigle list details page', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
    listDetailsPage.selectCheckBoxs([1]);
  });

  When('I navigate to a sigle list GFW details page', () => {
    locationsPage.clickOnLocationsList('Palm Oil Mills');
    listDetailsPage.selectCheckBoxs([1]);
  });

  When('I navigate to a multiple lists details page', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
    listDetailsPage.selectCheckBoxs([1, 2]);
  });

  When('I navigate to a multiple lists GFW details page', () => {
    locationsPage.clickOnLocationsList('Palm Oil Mills');
    listDetailsPage.selectCheckBoxs([1, 2]);
  });

  When('I navigate to a full lists details page', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
    listDetailsPage.clickOnFullListMapBtn();
  });

  When('I navigate to a full lists GFW details page', () => {
    locationsPage.clickOnLocationsList('Palm Oil Mills');
    listDetailsPage.clickOnFullListMapBtn();
  });

  When('I click on list diagnostic button', () => {
    listDetailsPage.clickOnListDiagnosticsBtn();
  });

  Then('I should be redirected to diagnostic view and verify single location', () => {
    diagnosticsPage.clickOnDiagnosticMap();
    cy.url().should('include', '/map');
    mapPage.elements
      .titleList('787 - AAT Argentina Points Generic')
      .should('have.text', '787 - AAT Argentina Points Generic');
  });

  Then('I should be redirected to diagnostic view GFW and verify single location', () => {
    diagnosticsPage.clickOnDiagnosticMap();
    cy.url().should('include', '/map');
    mapPage.elements
      .titleList('2,154 - Palm Oil Mills')
      .should('have.text', '2,154 - Palm Oil Mills');
  });

  Then('I should be redirected to diagnostic view and verify multiple locations', () => {
    diagnosticsPage.clickOnDiagnosticMap();
    cy.url().should('include', '/map');
    mapPage.elements
      .titleList('787 - AAT Argentina Points Generic')
      .should('have.text', '787 - AAT Argentina Points Generic');
  });

  Then('I should be redirected to diagnostic view GFW and verify multiple locations', () => {
    diagnosticsPage.clickOnDiagnosticMap();
    cy.url().should('include', '/map');
    mapPage.elements
      .titleList('2,154 - Palm Oil Mills')
      .should('have.text', '2,154 - Palm Oil Mills');
  });

  Then('I should be redirected to diagnostic view and verify full list locations', () => {
    cy.url().should('include', '/map');
    mapPage.elements
      .titleList('787 - AAT Argentina Points Generic')
      .should('have.text', '787 - AAT Argentina Points Generic');
  });

  Then('I should be redirected to diagnostic view GFW and verify full list locations', () => {
    cy.url().should('include', '/map');
    mapPage.elements
      .titleList('2,154 - Palm Oil Mills')
      .should('have.text', '2,154 - Palm Oil Mills');
  });
});
