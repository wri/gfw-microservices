import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';

describe('Location diagnostics', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();

  Given('I am logged in', () => {
    cy.loginUI();
    cy.visit('/locations');
  });

  When('I navigate to locations and select the list', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
  });

  When('I navigate to locations and select the GFW list', () => {
    locationsPage.clickOnLocationsList('Palm Oil Mills');
  });

  When('I hover over a location and click the Locations Map button', () => {
    listDetailsPage.clickOnLocationMapBtnOnHover();
  });

  When('I choose multiple locations and press the Locations Map button', () => {
    listDetailsPage.selectCheckBoxes([1, 2]);
    listDetailsPage.clickOnLocationMapBtn();
  });

  When('I click Full List Map', () => {
    listDetailsPage.clickOnFullListMapBtn();
  });

  Then('I should be redirected to map', () => {
    cy.location('href').should('include', 'map');
  });

  When('I navigate to the map from a draft list', () => {
    locationsPage.clickOnMoreOptionsList('AAT Test Regression Draft List');
    locationsPage.clickOnMapBtn();
  });

  When('I navigate to the map from an active list', () => {
    locationsPage.clickOnMoreOptionsList('AAT Argentina Points Generic');
    locationsPage.clickOnMapBtn();
  });
});
