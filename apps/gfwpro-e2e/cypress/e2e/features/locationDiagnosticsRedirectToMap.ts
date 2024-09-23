import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import * as User from '../../app-api/User';
import MapPage from '../../pages/mapPage';

describe('Location diagnostics', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  const mapPage = new MapPage();

  Given('I login in the landing page', () => {
    User.login();
    cy.visit('/locations');
  });

  When('I navigate to a location details page', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
  });

  When('I navigate to a location details page in GFW', () => {
    locationsPage.clickOnLocationsList('Palm Oil Mills');
  });

  When('I select a single location for diagnostics', () => {
    listDetailsPage.selectCheckBoxes([1]);
    listDetailsPage.clickOnLocationMapBtn();
  });

  When('I navigate to the map from a draft list', () => {
    locationsPage.clickOnMoreOptionsList('AAT Test Regression Draft List');
    locationsPage.clickOnMapBtn();
  });

  When('I navigate to the map from an active list', () => {
    locationsPage.clickOnMoreOptionsList('AAT Argentina Points Generic');
    locationsPage.clickOnMapBtn();
  });

  When('I navigate to a list details page', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
    listDetailsPage.clickOnFullListMapBtn();
  });

  When('I navigate to a list details page in GFW', () => {
    locationsPage.clickOnLocationsList('Palm Oil Mills');
    listDetailsPage.clickOnFullListMapBtn();
  });

  Then('I should be redirected to the GFW map view', () => {
    cy.url().should('include', '/map?listId=3&isGfwList=true');
    mapPage.elements
      .titleList('3,929 - All Locations')
      .should('have.text', '3,929 - All Locations');
  });

  Then('I should be redirected to the map view', () => {
    cy.url().should('include', '/map?listId=2&isGfwList=false');
    mapPage.elements
      .titleList('3,929 - All Locations')
      .should('have.text', '3,929 - All Locations');
  });

  Then('I should be redirected to the draft list map view', () => {
    cy.url().should('include', '/map?visibleLayers=Tree+cover+loss&listId=1038');
    mapPage.elements
      .titleList('3 - AAT Test Regression Draft List')
      .should('have.text', '3 - AAT Test Regression Draft List');
  });

  Then('I should be redirected to the active list map view', () => {
    cy.url().should('include', '/map?visibleLayers=Tree+cover+loss&listId=2');
    mapPage.elements
      .titleList('787 - AAT Argentina Points Generic')
      .should('have.text', '787 - AAT Argentina Points Generic');
  });

  Then('I should be redirected to the full list map view', () => {
    cy.url().should('include', '/map?listId=2');
    mapPage.elements
      .titleList('787 - AAT Argentina Points Generic')
      .should('have.text', '787 - AAT Argentina Points Generic');
  });

  Then('I should be redirected to the full list map view in GFW', () => {
    cy.url().should('include', '/map?listId=3');
    mapPage.elements
      .titleList('2,154 - Palm Oil Mills')
      .should('have.text', '2,154 - Palm Oil Mills');
  });
});
