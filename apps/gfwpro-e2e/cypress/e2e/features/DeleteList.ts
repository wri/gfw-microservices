import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';

describe('Delete List', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  const timestamp = Date.now();
  const listToDelete = [`testregressiondeletelist${timestamp}`];

  When('I login in the landing page', () => {
    cy.loginUI();
    cy.visit('/locations');
  });

  When('I navigate to a list details page', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
  });

  Then('I should be able to create a list as a copy and save as draft', () => {
    listDetailsPage.copyLists(listToDelete);
  });

  Then('I should see the created list in the locations page', () => {
    cy.visit('/locations').reload();
    locationsPage.verifyLists(listToDelete, true);
  });

  Then('I should be able to delete the list from the locations page', () => {
    locationsPage.deleteLists(listToDelete);
  });

  Then('I should verify the list is deleted from the locations page', () => {
    cy.visit('/locations').reload();
    locationsPage.verifyLists(listToDelete, false);
  });
});
