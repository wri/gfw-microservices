import { Before, Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';

describe('List Copy Feature', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  let timestamp: number;
  let listsToCreate: Record<string, string>;
  let currentListName = '';
  const checkboxLocations = [1, 2];
  const isGFW = true;

  // Generate unique timestamp for each scenario to avoid collisions when running all tests together
  Before(() => {
    // Add small random component to ensure uniqueness even if tests run in quick succession
    timestamp = Date.now() + Math.floor(Math.random() * 1000);
    listsToCreate = {
      'RSPO Palm Concessions': `testregressioncopylistGFW RSPO ${timestamp}`,
      'Oil Palm Concessions': `testregressioncopylistGFW OilPalm ${timestamp}`,
      'Administrative Areas': `testregressioncopylistGFW Admin ${timestamp}`,
      'Protected Areas': `testregressioncopylistGFW Protected ${timestamp}`,
      'Palm Oil Mills': `testregressioncopylistGFW Mills ${timestamp}`,
    };
  });
  Given('I login in the landing page', () => {
    cy.loginUI();
    cy.visit('/locations');
  });

  When('I navigate to the list details page for GFW Palm Oil Mills', () => {
    currentListName = 'Palm Oil Mills';
    locationsPage.clickOnLocationsList(currentListName);
  });

  When('I navigate to the list details page for GFW RSPO Palm Concessions', () => {
    currentListName = 'RSPO Palm Concessions';
    locationsPage.clickOnLocationsList(currentListName);
  });

  When('I navigate to the list details page for GFW Oil Palm Concessions', () => {
    currentListName = 'Oil Palm Concessions';
    locationsPage.clickOnLocationsList(currentListName);
  });

  When('I navigate to the list details page for GFW Protected Areas', () => {
    currentListName = 'Protected Areas';
    locationsPage.clickOnLocationsList(currentListName);
  });

  When('I navigate to the list details page for GFW Administrative Areas', () => {
    currentListName = 'Administrative Areas';
    locationsPage.clickOnLocationsList(currentListName);
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
    const listNameToUse = listsToCreate[currentListName];
    listDetailsPage.copyLists([listNameToUse], checkboxLocations, isGFW);
  });

  Then('I should see the created list on the locations page', () => {
    cy.visit('/locations').reload();
    const listNameToUse = listsToCreate[currentListName];
    locationsPage.verifyLists([listNameToUse], true);
  });

  Then('I should be able to delete the list from the locations page', () => {
    const listNameToUse = listsToCreate[currentListName];
    locationsPage.deleteLists([listNameToUse]);
  });

  Then('I should verify the list has been deleted from the locations page', () => {
    cy.visit('/locations').reload();
    const listNameToUse = listsToCreate[currentListName];
    locationsPage.verifyLists([listNameToUse], false);
  });
});
