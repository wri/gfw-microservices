import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import * as User from '../../app-api/User';

describe('Delete List', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();

  When('I login in the landing page', () => {
    User.login();
    cy.visit('/locations');
  });

  When('I navigate to a list details page', () => {
    locationsPage.clickOnLocationsList('newlistcopytest');
  });

  When('I click on list diagnostic button', () => {
    listDetailsPage.clickOnListDiagnosticsBtn();
  });

  Then('I should see the delete view', () => {
    listDetailsPage.clickOnCheckBoxSelectAll();
    listDetailsPage.clickOnDeleteBtn();
    expect(listDetailsPage.elements.confirmActionBtn().should('be.visible'));
  });
});
