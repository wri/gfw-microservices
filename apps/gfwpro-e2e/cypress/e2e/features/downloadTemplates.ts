import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';

describe('Downloading Templates', () => {
  const locationsPage = new LocationsPage();
  When('I login in the landing page', () => {
    cy.loginUI();
  });

  When('I navigate to the Locations page', () => {
    cy.visit('/locations');
  });

  When('I click on the Add Locations button and select the file upload option', () => {
    locationsPage.clickOnAddLocationsBtn();
    locationsPage.clickOnDataFileUploadBtn();
  });

  When('I click on the Data Templates button', () => {
    locationsPage.clickOndataTemplatesBtn();
  });

  Then('I should be able to download the Polygon Shapefile template', () => {
    locationsPage.elements.shapefileOption().should('be.visible');
  });

  Then('I should be able to download the KML template', () => {
    locationsPage.elements.kmlOption().should('be.visible');
  });
  Then('I should be able to download the SpreadSheet template', () => {
    locationsPage.elements.spreadSheetOption().should('be.visible');
  });
  Then('I should be able to download the Point Shapefile template', () => {
    locationsPage.elements.pointShapefileOption().should('be.visible');
  });
  Then('I should be able to download the List of Palm Mill template', () => {
    locationsPage.elements.listOfPalmMillIDsOption().should('be.visible');
  });
  When('I click on the Polygon Shapefile option and click the Download button', () => {
    locationsPage.clickOnShapeFileOptionBtn();
    locationsPage.clickOnDownloadTemplateUploadLocationBtn();
  });
  When('I click on the KML option and click the Download button', () => {
    locationsPage.clickOnKMLOptionBtn();
    locationsPage.clickOnDownloadTemplateUploadLocationBtn();
  });
  When('I click on the SpreadSheet option and click the Download button', () => {
    locationsPage.clickOnSpreadSheetOptionBtn();
    locationsPage.clickOnDownloadTemplateUploadLocationBtn();
  });
  When('I click on the Point Shapefile option and click the Download button', () => {
    locationsPage.clickOnPointShapefileOptionBtn();
    locationsPage.clickOnDownloadTemplateUploadLocationBtn();
  });
  When('I click on the List of Palm Mill option and click the Download button', () => {
    locationsPage.clickOnListOfPalmMillIDsOptionBtn();
    locationsPage.clickOnDownloadTemplateUploadLocationBtn();
  });

  Then('I should see a checkmark button', () => {
    locationsPage.elements.checkBtn();
  });
});
