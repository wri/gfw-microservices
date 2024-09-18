import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import BasePage from '../../pages/basePage';
import AlertsPage from '../../pages/alertsPage';
import * as User from '../../app-api/User';

describe('Alerts Page', () => {
  const basePage = new BasePage();
  const alertsPage = new AlertsPage();

  Given('I log in to the application', () => {
    User.login();
  });

  When('I navigate to the Alerts', () => {
    basePage.navigateToAlertsPage();
    cy.url().should('include', '/dashboard');
  });

  When('I select a list from the dropdown menu', () => {
    alertsPage.selectListFromDropDown('AAT Argentina Points Generic');
  });

  Then('I should see the locations displayed on the map', () => {
    alertsPage.elements.pageTitle().should('have.text', 'Alerts 787 Locations');
  });

  When('I navigate to the map page', () => {
    alertsPage.navigateToListMap();
    cy.url().should('include', '/map');
  });

  Then('I should see the locations from the selected list on the map', () => {
    alertsPage.elements.listInfo().should('have.text', '787 - AAT Argentina Points Generic');
  });
});
