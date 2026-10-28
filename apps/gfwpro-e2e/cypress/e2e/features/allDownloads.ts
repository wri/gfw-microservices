import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';

describe('Locations View', () => {
  const locationsPage = new LocationsPage();
  const listDetailPage = new ListDetailsPage();

  When('I login in the landing page', () => {
    cy.loginUI();
    cy.visit('/locations');
  });

  Then('Verify the Locations screen', () => {
    cy.location('href').should('include', '/locations');
  });

  Then('I test download list on Locations', () => {
    locationsPage.clickOnMoreOptionsListOK();
    expect(locationsPage.elements.downloadListBtn().should('be.visible'));
    locationsPage.clickOnDownloadList();
    expect(locationsPage.elements.downloadCSVOptionBtn().should('be.visible'));
    expect(locationsPage.elements.downloadShapefileptionBtn().should('be.visible'));

    //Download CSV
    listDetailPage.clickOnCSVOption();
    expect(listDetailPage.elements.titleAlertDownloadList().should('be.visible'));
    expect(listDetailPage.elements.descriptionAlertDownloadList().should('be.visible'));
    listDetailPage.clickCloseAlertDownload();

    locationsPage.clickOnMoreOptionsListOK();
    //Download Shapefile
    locationsPage.clickOnDownloadList();
    listDetailPage.clickOnShapefileOption();
    expect(listDetailPage.elements.titleAlertDownloadList().should('be.visible'));
    expect(listDetailPage.elements.descriptionAlertDownloadList().should('be.visible'));
    listDetailPage.clickCloseAlertDownload();

    locationsPage.clickOnMoreOptionsListOK();
    //Download GeoJSON
    locationsPage.clickOnDownloadList();
    expect(locationsPage.elements.downloadGeojsonOptionBtn().should('be.visible'));
    locationsPage.clickOnGeojsonDownloadOption();
    expect(listDetailPage.elements.titleAlertDownloadList().should('be.visible'));
    expect(listDetailPage.elements.descriptionAlertDownloadList().should('be.visible'));
    listDetailPage.clickCloseAlertDownload();
  });

  Then('I test download list into list details', () => {
    locationsPage.clickOnOptionListOK();
    listDetailPage.checkOnCheckBoxSelectAll();
    expect(listDetailPage.elements.downloadBtn().should('be.visible'));
    listDetailPage.clickOnDownload();
    expect(listDetailPage.elements.downloadCSVOptionListDetail().should('be.visible'));
    expect(listDetailPage.elements.downloadShapefileptionListDetail().should('be.visible'));
    //Download CSV
    listDetailPage.clickOnCSVOption();
    expect(listDetailPage.elements.titleAlertDownloadList().should('be.visible'));
    expect(listDetailPage.elements.descriptionAlertDownloadList().should('be.visible'));
    listDetailPage.clickCloseAlertDownload();
    //Download Shapefile
    listDetailPage.clickOnDownload();
    listDetailPage.clickOnShapefileOption();
    expect(listDetailPage.elements.titleAlertDownloadList().should('be.visible'));
    expect(listDetailPage.elements.descriptionAlertDownloadList().should('be.visible'));
    listDetailPage.clickCloseAlertDownload();
    //Download GeoJSON
    listDetailPage.clickOnDownload();
    expect(listDetailPage.elements.downloadGeojsonOptionListDetail().should('be.visible'));
    listDetailPage.clickOnGeojsonOption();
    expect(listDetailPage.elements.titleAlertDownloadList().should('be.visible'));
    expect(listDetailPage.elements.descriptionAlertDownloadList().should('be.visible'));
    listDetailPage.clickCloseAlertDownload();
  });
});
