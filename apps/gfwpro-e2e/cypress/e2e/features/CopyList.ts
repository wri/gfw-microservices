import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import * as User from '../../app-api/User';

const isFeatureStable = false;

describe('Copy List', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  const timestamp = Date.now();
  const listsToCreate = [`testregressioncopylist${timestamp}`];

  When('I login in the landing page', () => {
    if (isFeatureStable) {
      User.login();
      cy.visit('/locations');
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  When('I navigate to a list details page', () => {
    if (isFeatureStable) {
      locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  Then('I should be able to copy a list and save as draft', () => {
    if (isFeatureStable) {
      listDetailsPage.copyLists(listsToCreate);
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  Then('I should see the created list in the locations page', () => {
    if (isFeatureStable) {
      cy.visit('/locations').reload();
      locationsPage.verifyLists(listsToCreate, true);
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  Then('I should be able to delete the list from the locations page', () => {
    if (isFeatureStable) {
      locationsPage.deleteLists(listsToCreate);
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  Then('I should verify the list is deleted from the locations page', () => {
    if (isFeatureStable) {
      cy.visit('/locations').reload();
      locationsPage.verifyLists(listsToCreate, false);
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });
});
