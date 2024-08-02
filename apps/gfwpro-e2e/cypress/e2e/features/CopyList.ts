import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import * as User from '../../app-api/User';

describe('Copy List', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();

  const listsToCreate = ['testregresioncopylisttomove', 'testregresioncopylisttoremove'];

  When('I login in the landing page', () => {
    User.login();
    cy.visit('/locations');
  });

  When('I navigate to a list details page', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
  });

  Then('I should see the copy view', () => {
    listDetailsPage.createLists(listsToCreate);
  });

  Then('I should see the created lists in the locations page', () => {
    cy.visit('/locations');
    locationsPage.verifyLists(listsToCreate, true);
  });
});
