import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';

describe('Upload File Csv', () => {
  const csv = 'CG9.csv';
  const timestamp = Date.now();
  const listToUploadSingleLocation = `uploadfilecsv${timestamp}`;
  const locationPage = new LocationsPage();
  Given('I login in the landing page', () => {
    cy.loginUI();
  });

  When('I navigate to the Locations page', () => {
    cy.visit('/locations');
  });

  When('I click on the Add Location button', () => {
    locationPage.clickOnAddLocations2Btn();
  });
  When('I select the file upload option', () => {
    locationPage.clickOnfileUploadBtn();
  });
  When('I select the Polygon option', () => {
    locationPage.clickOnPolygonBtn();
  });
  When('I select the Point option', () => {
    locationPage.clickOnPointBtn();
  });

  When('I click on the Drop file button and drag a CSV file', () => {
    cy.uploadFile(csv, 'application/vnd.google-earth.csv+xml');
    locationPage.clickOnNextBtn();
    locationPage.clickOnNextBtn();
  });

  Then('I complete the form and confirm the upload', () => {
    locationPage.selectCommodity('Coffee');
    locationPage.typeNewNameList(listToUploadSingleLocation);
    locationPage.clickOnCheckBoxIcon();
    locationPage.clickOnNextBtn();
    locationPage.clickOnSubmitAnalisys();
    locationPage.clickOnConfirmAnalisysBtn();
  });

  Then('I should see the completion legend', () => {
    locationPage.elements.titleFinishLegend().should('be.visible');
    locationPage.elements.subtitleFinishLegend().should('be.visible');
    locationPage.elements.returnToLocationBtn().should('be.visible');
  });
});
