import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor';
import BasePage from '../../pages/basePage';
import AlertsPage from '../../pages/alertsPage';
import * as User from '../../app-api/User';

describe('Alerts page', () => {
  const basePage = new BasePage();
  const alertsPage = new AlertsPage();

  Given('I login to the landing page', () => {
    User.login();
    cy.visit('/locations');
  });

  When('I navigate to the alerts page', () => {
    basePage.navigateToAlertsPage();
    cy.url().should('include', '/dashboard');
  });

  When('I select a List from the dropdown', () => {
    alertsPage.selectListFromDropDown('AAT Argentina Points Generic');
  });

  When('I select a List GFW from the dropdown', () => {
    alertsPage.selectListFromDropDown('Palm Oil Mills');
  });

  Then('I should be able to view the alerts on the map and interact with the features', () => {
    alertsPage.elements.pageTitle().should('have.text', 'Alerts 787 Locations');
    alertsPage.elements.listInfo().should('have.text', '787 - AAT Argentina Points Generic');
    alertsPage.navigateToListMap();
    cy.url().should('include', '/map');
    alertsPage.elements.listInfo().should('have.text', '787 - AAT Argentina Points Generic');
  });

  Then(
    'I should be able to view the alerts list GFW on the map and interact with the features',
    () => {
      alertsPage.elements.pageTitle().should('have.text', 'Alerts 2,154 Locations');
      alertsPage.elements.listInfo().should('have.text', '2,154 - Palm Oil Mills');
      alertsPage.navigateToListMap();
      cy.url().should('include', '/map');
      alertsPage.elements.listInfo().should('have.text', '2,154 - Palm Oil Mills');
    }
  );
});
