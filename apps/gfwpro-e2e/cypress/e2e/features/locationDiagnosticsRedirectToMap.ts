import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import * as User from '../../app-api/User';
import MapPage from '../../pages/mapPage';

describe('Location diagnostics', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  const mapPage = new MapPage();

  Given('I am logged in', () => {
    User.login();
    cy.visit('/locations');
  });

  When('I navigate to locations and select the list', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
  });

  When('I navigate to locations and select the GFW list', () => {
    locationsPage.clickOnLocationsList('Palm Oil Mills');
  });

  When('I choose a location and press the Locations Map button', () => {
    listDetailsPage.selectCheckBoxes([1]);
    listDetailsPage.clickOnLocationMapBtn();
  });

  When('I choose multiple locations and press the Locations Map button', () => {
    listDetailsPage.selectCheckBoxes([1, 2]);
    listDetailsPage.clickOnLocationMapBtn();
  });

  When('I click Full List Map', () => {
    listDetailsPage.clickOnFullListMapBtn();
  });

  Then('I should be redirected to map with the selected location from GFW list', () => {
    cy.url().should('include', '/map?listId=3&isGfwList=true');
    mapPage.elements
      .titleList('3,929 - All Locations')
      .should('have.text', '3,929 - All Locations');
  });

  Then('I should be redirected to map with all locations from the GFW list', () => {
    cy.url().should('include', '/map?listId=3&isGfwList=true');
    mapPage.elements
      .titleList('2,154 - Palm Oil Mills')
      .should('have.text', '2,154 - Palm Oil Mills');
  });

  Then('I should be redirected to map with the selected location from the list', () => {
    cy.url().should('include', '/map?listId=2&isGfwList=false');
    mapPage.elements
      .titleList('787 - AAT Argentina Points Generic')
      .should('have.text', '787 - AAT Argentina Points Generic');
  });

  When('I navigate to the map from a draft list', () => {
    locationsPage.clickOnMoreOptionsList('AAT Test Regression Draft List');
    locationsPage.clickOnMapBtn();
  });

  When('I navigate to the map from an active list', () => {
    locationsPage.clickOnMoreOptionsList('AAT Argentina Points Generic');
    locationsPage.clickOnMapBtn();
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
});
