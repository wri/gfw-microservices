import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';

describe('Downloading Templates', () => {
  const locationPage = new LocationsPage();
  When('I login in the landing page', () => {
    cy.loginUI();
  });

  When('I navigate to the Locations page', () => {
    cy.visit('/locations');
  });

  When('I click on the Add Location Alpa button and select the file upload option', () => {
    locationPage.clickOnAddLocations2Btn();
    locationPage.clickOnfileUploadBtn();
  });

  When('I click on the Data Templates button', () => {
    locationPage.clickOndataTemplatesBtn();
  });

  Then('I should be able to download the Polygon Shapefile template', () => {
    locationPage.elements.ShapefileOption().should('be.visible');
  });

  Then('I should be able to download the KML template', () => {
    locationPage.elements.KMLOption().should('be.visible');
  });
  Then('I should be able to download the SpreadSheet template', () => {
    locationPage.elements.SpreadSheetOption().should('be.visible');
  });
  Then('I should be able to download the Point Shapefile template', () => {
    locationPage.elements.PointShapefileOption().should('be.visible');
  });
  Then('I should be able to download the List of Palm Mill template', () => {
    locationPage.elements.ListOfPalmOilOption().should('be.visible');
  });
  When('I click on the Polygon Shapefile option and click the Download button', () => {
    locationPage.clickOnShapeFileOptionBtn();
    locationPage.clickOnDownloadTemplateUploadLocationBtn();
  });
  When('I click on the KML option and click the Download button', () => {
    locationPage.clickOnKMLOptionBtn();
    locationPage.clickOnDownloadTemplateUploadLocationBtn();
  });
  When('I click on the SpreadSheet option and click the Download button', () => {
    locationPage.clickOnSpreadSheetOptionBtn();
    locationPage.clickOnDownloadTemplateUploadLocationBtn();
  });
  When('I click on the Point Shapefile option and click the Download button', () => {
    locationPage.clickOnPointShapefileOptionBtn();
    locationPage.clickOnDownloadTemplateUploadLocationBtn();
  });
  When('I click on the List of Palm Mill option and click the Download button', () => {
    locationPage.clickOnListOfPalmMillOptionBtn();
    locationPage.clickOnDownloadTemplateUploadLocationBtn();
  });

  Then('I should see a checkmark button', () => {
    locationPage.elements.checkBtn();
  });
});
