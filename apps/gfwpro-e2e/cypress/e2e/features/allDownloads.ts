import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import * as User from '../../app-api/User';
import AlertsPage from '../../pages/alertsPage';
import BasePage from '../../pages/basePage';

describe('Locations View', () => {
  const locationPage = new LocationsPage();
  const listDetailPage = new ListDetailsPage();
  const alertsPage = new AlertsPage();
  const basePage = new BasePage();

  When('I login in the landing page', () => {
    User.login();
  });

  Then('Verify the Locations screen', () => {
    cy.url().should('include', '/locations');
  });

  Then('I test download list on Locations', () => {
    locationPage.clickOnMoreOptionsListOK();
    expect(locationPage.elements.downloadListBtn().should('be.visible'));
    locationPage.clickOnDownloadList();
    expect(listDetailPage.elements.downloadCSVOptionBtn().should('be.visible'));
    expect(listDetailPage.elements.downloadShapefileptionBtn().should('be.visible'));

    //Download CSV
    listDetailPage.clickOnCSVOption();
    expect(listDetailPage.elements.titleAlertDownloadList().should('be.visible'));
    expect(listDetailPage.elements.descriptionAlertDownloadList().should('be.visible'));
    listDetailPage.clickCloseAlertDownload();

    locationPage.clickOnMoreOptionsListOK();
    //Download Shapefile
    locationPage.clickOnDownloadList();
    listDetailPage.clickOnShapefileOption();
    expect(listDetailPage.elements.titleAlertDownloadList().should('be.visible'));
    expect(listDetailPage.elements.descriptionAlertDownloadList().should('be.visible'));
    listDetailPage.clickCloseAlertDownload();
  });

  Then('I test download list into list details', () => {
    locationPage.clickOnOptionListOK();
    listDetailPage.clickOnCheckBoxSelectAll();
    expect(listDetailPage.elements.downloadBtn().should('be.visible'));
    listDetailPage.clickOnDownload();
    expect(listDetailPage.elements.downloadCSVOptionBtn().should('be.visible'));
    expect(listDetailPage.elements.downloadResultsOptionBtn().should('be.visible'));
    expect(listDetailPage.elements.downloadShapefileptionBtn().should('be.visible'));
    //Download CSV
    listDetailPage.clickOnCSVOption();
    expect(listDetailPage.elements.titleAlertDownloadList().should('be.visible'));
    expect(listDetailPage.elements.descriptionAlertDownloadList().should('be.visible'));
    listDetailPage.clickCloseAlertDownload();
    //Download Results
    listDetailPage.clickOnDownload();
    listDetailPage.clickOnResultsOption();
    expect(listDetailPage.elements.titleAlertDownloadList().should('be.visible'));
    expect(listDetailPage.elements.descriptionAlertDownloadList().should('be.visible'));
    listDetailPage.clickCloseAlertDownload();
    //Download Shapefile
    listDetailPage.clickOnDownload();
    listDetailPage.clickOnShapefileOption();
    expect(listDetailPage.elements.titleAlertDownloadList().should('be.visible'));
    expect(listDetailPage.elements.descriptionAlertDownloadList().should('be.visible'));
    listDetailPage.clickCloseAlertDownload();
  });

  When('I navigate to the alerts page', () => {
    basePage.navigateToAlertsPage();
    cy.url().should('include', '/dashboard');
  });

  Then('I test download into Alerts', () => {
    alertsPage.selectListFromDropDown('AAT Argentina Points Generic');
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
    alertsPage.elements.listInfo().should('have.text', '787 - AAT Argentina Points Generic');
  });
});
