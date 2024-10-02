import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import EditPage from '../../pages/editPage';
import * as User from '../../app-api/User';

describe('Edit List', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  const editPage = new EditPage();

  When('I login in the landing page', () => {
    User.login();
    cy.visit('/locations');
  });

  When('I navigate to a list details page', () => {
    locationsPage.clickOnLocationsList('AAT Test Edit List 4');
  });

  When('I select a location and press the Edit button', () => {
    listDetailsPage.selectCheckBoxes([1]);
    listDetailsPage.clickOnEditBtn();
  });

  Then('I should be able to edit on a cell', () => {
    editPage.editCell('1');
  });

  When('I press the Cancel button', () => {
    editPage.clickOnCancelBtn();
  });

  When('I press the Update button', () => {
    editPage.clickOnUpdateBtn();
    editPage.clickOnConfirmBtn();
  });

  Then('I should be able to cancel the edit and return to the list details view', () => {
    cy.url().should('include', '/list-details/lists');
  });
  Then('I should be able to confirm the edit and be redirected to the list details view', () => {
    cy.url().should('include', '/locations');
  });
});
