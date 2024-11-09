import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import * as User from '../../app-api/User';

describe('List Copy Feature', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  const timestamp = Date.now();
  const listsToCreate = [`testregressioncopylistGFW${timestamp}`];
  const checkboxLocations = [1, 2];

  Given('I login in the landing page', () => {
    User.login();
    cy.visit('/locations');
  });

  When('I navigate to the list details page for GFW Palm Oil Mills', () => {
    locationsPage.clickOnLocationsList('Palm Oil Mills');
  });

  When('I navigate to the list details page for GFW RSPO Palm Concessions', () => {
    locationsPage.clickOnLocationsList('RSPO Palm Concessions');
  });

  When('I navigate to the list details page for GFW Oil Palm Concessions', () => {
    locationsPage.clickOnLocationsList('Oil Palm Concessions');
  });

  When('I navigate to the list details page for GFW Protected Areas', () => {
    locationsPage.clickOnLocationsList('Protected Areas');
  });

  When('I navigate to the list details page for GFW Administrative Areas', () => {
    locationsPage.clickOnLocationsList('Administrative Areas');
  });

  Then('I should be able to select the country for the Protected Areas list GFW', () => {
    listDetailsPage.selectCountryForProtectedAreas('Argentina');
    listDetailsPage.clickOnApply();
  });

  Then('I should be able to select the country for the Administrative Areas list GFW', () => {
    listDetailsPage.selectCountryForAdminAreas('Argentina');
    listDetailsPage.clickOnApply();
  });

  Then('I should be able to copy a GFW list and save it as a draft', () => {
    cy.url().should('include', '/list-details');
    listDetailsPage.copyLists(listsToCreate, checkboxLocations);
  });

  Then('I should see the created list on the locations page', () => {
    cy.visit('/locations').reload();
    locationsPage.verifyLists(listsToCreate, true);
  });

  Then('I should be able to delete the list from the locations page', () => {
    locationsPage.deleteLists(listsToCreate);
  });

  Then('I should verify the list has been deleted from the locations page', () => {
    cy.visit('/locations').reload();
    locationsPage.verifyLists(listsToCreate, false);
  });
});
