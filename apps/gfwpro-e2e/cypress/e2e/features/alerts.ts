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

  Then('I should be able to view the alerts on the map and interact with the features', () => {
    alertsPage.elements.pageTitle().should('have.text', 'Alerts 787 Locations');
    alertsPage.elements.listInfo().should('have.text', '787 - AAT Argentina Points Generic ');
    alertsPage.elements.subtitle().should('have.text', 'Last Week');
    alertsPage.elements.monthRadioBtn().click();
    alertsPage.elements.subtitle().should('have.text', 'Last Month');
    alertsPage.elements.quarterRadioBtn().click();
    alertsPage.elements.subtitle().should('have.text', 'Last Quarter');
    alertsPage.elements.yearRadioBtn().click();
    alertsPage.elements.subtitle().should('have.text', 'Last Year');
    alertsPage.elements.reportBtn().should('be.visible');
    alertsPage.downloadAlertsReport();
    alertsPage.elements
      .downloadConfirmationTitle()
      .should('have.text', 'List file Download')
      .and('be.visible');
    alertsPage.elements
      .downloadConfirmationMessage()
      .should(
        'have.text',
        "You have selected a list file for download. Please check your email for your data's download link."
      )
      .and('be.visible');
    alertsPage.elements.downloadConfirmationCloseBtn().click();
    alertsPage.navigateToListMap();
    cy.url().should('include', '/map');
    alertsPage.elements.listInfo().should('have.text', '787 - AAT Argentina Points Generic ');
  });
});
