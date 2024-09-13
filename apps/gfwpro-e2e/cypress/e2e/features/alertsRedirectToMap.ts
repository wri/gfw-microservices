import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import BasePage from '../../pages/basePage';
import AlertsPage from '../../pages/alertsPage';
import * as User from '../../app-api/User';

describe('Alerts page', () => {
  const basePage = new BasePage();
  const alertsPage = new AlertsPage();

  Given('I login in the landing page', () => {
    User.login();
    cy.visit('/locations');
  });

  When('I navigate to the alerts page', () => {
    basePage.navigateToAlertsPage();
    cy.url().should('include', '/dashboard');
  });

  When('I select a list from the dropdown', () => {
    alertsPage.selectListFromDropDown('AAT Argentina Points Generic');
  });

  Then('I should be able to view the alerts on the map and interact with the features', () => {
    alertsPage.elements.pageTitle().should('have.text', 'Alerts 787 Locations');
    alertsPage.elements.listInfo().should('have.text', '787 - AAT Argentina Points Generic');
    alertsPage.navigateToListMap();
    cy.url().should('include', '/map');
    alertsPage.elements.listInfo().should('have.text', '787 - AAT Argentina Points Generic');
  });
});
