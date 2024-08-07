import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import * as User from '../../app-api/User';

describe('Move List', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();

  const listsToCreate = [
    `testregresionmovelistfrom-${Date.now()}`,
    `testregresionmovelistto-${Date.now()}`,
  ];

  When('I login in the landing page', () => {
    User.login();
    cy.visit('/locations');
  });

  When('I navigate to a list details page', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Polygons Generic');
  });

  Then('I should be able to create a list as a copy and save as draft', () => {
    listDetailsPage.copyLists(listsToCreate);
  });

  Then('I should see the created lists in the locations page', () => {
    cy.visit('/locations');
    locationsPage.verifyLists(listsToCreate, true);
  });

  When('I navigate to a list details page', () => {
    cy.visit('/locations');
    locationsPage.clickOnLocationsList(listsToCreate[0]);
  });

  Then('I should be able to move locations from a list into another one and save as draft', () => {
    listDetailsPage.moveList(listsToCreate[1]);
  });

  Then('I should be able to delete the lists from the locations page', () => {
    cy.visit('/locations');
    listDetailsPage.deleteLists(listsToCreate);
  });

  Then('I should verify the lists are deleted from the locations page', () => {
    cy.visit('/locations');
    locationsPage.verifyLists(listsToCreate, false);
  });
});
