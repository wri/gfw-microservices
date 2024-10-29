import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import * as User from '../../app-api/User';

const isFeatureStable = false;

describe('Move List', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  const timestamp = Date.now();
  const listsToCreate = [
    `testregressionmovelistfrom${timestamp}`,
    `testregressionmovelistto${timestamp}`,
  ];

  When('I login in the landing page', () => {
    if (isFeatureStable) {
      User.login();
      cy.visit('/locations');
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  When('I navigate to a list details page origin', () => {
    if (isFeatureStable) {
      locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  Then('I should be able to create a list as a copy and save as draft', () => {
    if (isFeatureStable) {
      listDetailsPage.copyLists(listsToCreate);
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  Then('I should see the created lists in the locations page', () => {
    if (isFeatureStable) {
      cy.visit('/locations').reload();
      locationsPage.verifyLists(listsToCreate, true);
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  When('I navigate to a list details page', () => {
    if (isFeatureStable) {
      cy.visit('/locations');
      locationsPage.clickOnLocationsList(listsToCreate[0]);
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  Then('I should be able to move locations from a list into another one and save as draft', () => {
    if (isFeatureStable) {
      listDetailsPage.moveList(listsToCreate[1], [1, 2]);
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  Then('I should see the list moved and saved as draft', () => {
    if (isFeatureStable) {
      cy.visit('/locations');
      locationsPage.clickOnLocationsList(listsToCreate[0]);
      cy.visit('/locations');
      locationsPage.clickOnLocationsList(listsToCreate[1]);
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  Then('I should be able to delete the lists from the locations page', () => {
    if (isFeatureStable) {
      cy.visit('/locations').reload();
      locationsPage.deleteLists(listsToCreate);
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  Then('I should verify the lists are deleted from the locations page', () => {
    if (isFeatureStable) {
      cy.visit('/locations').reload();
      locationsPage.verifyLists(listsToCreate, false);
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });
});
