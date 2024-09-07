import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import * as User from '../../app-api/User';
import MapPage from '../../pages/mapPage';

describe('Location diagnostics', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  const mapPage = new MapPage();

  When('I login in the landing page', () => {
    User.login();
    cy.visit('/locations');
  });

  Then('I navigate to map from list draft', () => {
    locationsPage.clickOnMoreOptionsList('AAT Test Regression Draft List');
    locationsPage.clickOnMapBtn();
  });

  Then('I navigate to map from list active', () => {
    locationsPage.clickOnMoreOptionsList('AAT Argentina Points Generic');
    locationsPage.clickOnMapBtn();
  });

  When('I navigate to a list details page and click on a single location', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
    listDetailsPage.selectCheckBoxs([1]);
  });

  When('I navigate to a list details GFW page and click on a single location', () => {
    locationsPage.clickOnLocationsList('Palm Oil Mills');
    listDetailsPage.selectCheckBoxs([1]);
  });

  When('I navigate to a listings details page', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
    listDetailsPage.clickOnFullListMapBtn();
  });

  When('I navigate to a listings details page GFW', () => {
    locationsPage.clickOnLocationsList('Palm Oil Mills');
    listDetailsPage.clickOnFullListMapBtn();
  });

  Then('I should be redirected to list draft map view', () => {
    cy.url().should('include', '/map?visibleLayers=Tree+cover+loss&listId=1038');
    mapPage.elements
      .titleList('3 - AAT Test Regression Draft List')
      .should('have.text', '3 - AAT Test Regression Draft List');
  });

  Then('I should be redirected to full list active map view', () => {
    cy.url().should('include', '/map?visibleLayers=Tree+cover+loss&listId=2');
    mapPage.elements
      .titleList('787 - AAT Argentina Points Generic')
      .should('have.text', '787 - AAT Argentina Points Generic');
  });

  Then('I should be redirected to full list map view', () => {
    cy.url().should('include', '/map?listId=2');
    mapPage.elements
      .titleList('787 - AAT Argentina Points Generic')
      .should('have.text', '787 - AAT Argentina Points Generic');
  });

  Then('I should be redirected to full list map view GFW', () => {
    cy.url().should('include', '/map?listId=3');
    mapPage.elements
      .titleList('2,154 - Palm Oil Mills')
      .should('have.text', '2,154 - Palm Oil Mills');
  });
});
