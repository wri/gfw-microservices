import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';

describe('Move List', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  const timestamp = Date.now() + Math.floor(Math.random() * 1000);
  const listsToCreate = [
    `testregressionmovelistfrom${timestamp}`,
    `testregressionmovelistto${timestamp}`,
  ];

  When('I login in the landing page', () => {
    cy.loginUI();
    cy.visit('/locations');
  });

  When('I navigate to a list details page origin', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
  });

  Then('I should be able to create a list as a copy and save as draft', () => {
    listDetailsPage.copyLists(listsToCreate);
  });

  Then('I should see the created lists in the locations page', () => {
    cy.visit('/locations').reload();
    locationsPage.verifyLists(listsToCreate, true);
  });

  When('I navigate to a list details page', () => {
    cy.visit('/locations');
    locationsPage.clickOnLocationsList(listsToCreate[0]);
  });

  Then('I should be able to move locations from a list into another one and save as draft', () => {
    listDetailsPage.moveList(listsToCreate[1], [1, 2]);
  });

  Then('I should see the list moved and saved as draft', () => {
    cy.visit('/locations');
    locationsPage.clickOnLocationsList(listsToCreate[0]);
    cy.visit('/locations');
    locationsPage.clickOnLocationsList(listsToCreate[1]);
  });

  Then('I should be able to delete the lists from the locations page', () => {
    cy.visit('/locations').reload();
    locationsPage.deleteLists(listsToCreate);
  });

  Then('I should verify the lists are deleted from the locations page', () => {
    cy.visit('/locations').reload();
    locationsPage.verifyLists(listsToCreate, false);
  });
});
