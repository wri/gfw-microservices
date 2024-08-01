import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import * as User from '../../app-api/User';
import ListDetailsPage from '../../pages/listDetailsPage';
describe('Maps View', () => {
  const locationPage = new LocationsPage();
  const listDetailPage = new ListDetailsPage();

  When('I login in the landing page', () => {
    User.login();
    cy.visit('/locations');
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
});
