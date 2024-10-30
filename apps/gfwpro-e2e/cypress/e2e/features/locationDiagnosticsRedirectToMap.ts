import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import * as User from '../../app-api/User';

describe('Location diagnostics', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();

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
    cy.location('href').should('include', '/map?listId=3&isGfwList=true');
  });

  Then('I should be redirected to map with all locations from the GFW list', () => {
    cy.location('href').should('include', '/map?listId=3&isGfwList=true');
  });

  Then('I should be redirected to map with the selected location from the list', () => {
    cy.location('href').should('include', '/map?listId=2&isGfwList=false');
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
    cy.location('href').should('include', '/map?visibleLayers=Tree+cover+loss&listId=1038');
  });

  Then('I should be redirected to the active list map view', () => {
    cy.location('href').should('include', '/map?visibleLayers=Tree+cover+loss&listId=2');
  });
});
