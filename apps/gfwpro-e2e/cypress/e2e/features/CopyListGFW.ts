import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import * as User from '../../app-api/User';

describe('Copy List', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();

  const listsToCreate = [`testregressioncopylistGFW`];
  const checkboxLocationGFW = [1, 2];

  When('I login in the landing page', () => {
    User.login();
    cy.visit('/locations');
  });

  When('I navigate to a list details page GFW Palm Oil Mills', () => {
    locationsPage.clickOnLocationsList('Palm Oil Mills');
  });
  When('I navigate to a list details page GFW RSPO Palm Concessions', () => {
    locationsPage.clickOnLocationsList('RSPO Palm Concessions');
  });
  When('I navigate to a list details page GFW Oil Palm Concessions', () => {
    locationsPage.clickOnLocationsList('Oil Palm Concessions');
  });
  When('I navigate to a list details page GFW Protected areas', () => {
    locationsPage.clickOnLocationsList('Protected Areas');
  });

  When('I navigate to a list details page GFW Administrative Areas', () => {
    locationsPage.clickOnLocationsList('Administrative Areas');
  });

  Then('I should be able to select country a Protected Areas list GFW', () => {
    listDetailsPage.selectorCountryProtectedAreas('Argentina');
    listDetailsPage.clickOnApplyFilters();
  });
  Then('I should be able to select country a Administrative Areas list GFW', () => {
    listDetailsPage.selectorCountryAdminAreas('Argentina');
    listDetailsPage.clickOnApplyFilters();
  });

  Then('I should be able to copy a list GFW and save as draft', () => {
    cy.url().should('include', '/list-details');
    listDetailsPage.copyLists(listsToCreate, checkboxLocationGFW);
  });

  Then('I should see the created list in the locations page', () => {
    cy.visit('/locations').reload();
    locationsPage.verifyLists(listsToCreate, true);
  });

  Then('I should be able to delete the list from the locations page', () => {
    locationsPage.deleteLists(listsToCreate);
  });

  Then('I should verify the list is deleted from the locations page', () => {
    cy.visit('/locations').reload();
    locationsPage.verifyLists(listsToCreate, false);
  });
});
