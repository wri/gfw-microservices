import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';

describe('Upload File Csv', () => {
  const filePath = 'cypress/fixtures/uploadCsv.xlsx';
  const timestamp = Date.now();
  const listToUploadSingleLocation = `uploadfilecsv${timestamp}`;
  const locationsPage = new LocationsPage();
  Given('I login in the landing page', () => {
    cy.loginUI();
  });

  When('I navigate to the Locations page', () => {
    cy.visit('/locations');
  });

  When('I click on the Add Locations button', () => {
    locationsPage.clickOnAddLocationsBtn();
  });
  When('I select the file upload option', () => {
    locationsPage.clickOnDataFileUploadBtn();
  });

  When('I click on the Drop file button and drag a CSV file', () => {
    cy.get('[data-testid="file-input"]').invoke('show').selectFile(filePath);
    // cy.uploadFile(csv);
    locationsPage.clickOnNextBtn();
  });

  Then('I should see a list preview', () => {
    locationsPage.elements.titleListPreview().should('be.visible');
    locationsPage.elements.backBtn().should('be.visible');
    locationsPage.elements.cancelBtn().should('be.visible');
    locationsPage.elements.titleListPreview().should('be.visible');
    locationsPage.elements.locationNameColumn().should('be.visible');
    locationsPage.elements.analysisRadiusColumn().should('be.visible');
    locationsPage.elements.analysisAreaColumn().should('be.visible');
    locationsPage.elements.latitudeColumn().should('be.visible');
    locationsPage.elements.longitudeColumn().should('be.visible');
    locationsPage.elements.stateColumn().should('exist');
    locationsPage.elements.countryColumn().should('exist');
    locationsPage.clickOnNextBtn();
  });

  Then('I complete the form and confirm the upload', () => {
    locationsPage.selectCommodity('Coffee');
    locationsPage.typeNewNameList(listToUploadSingleLocation);
    locationsPage.selectAnalisysType('post-2020');
    locationsPage.selectAnalisysType('post-2000');
    locationsPage.clickOnNextBtn();
    locationsPage.clickOnSubmitAnalisys();
    locationsPage.clickOnConfirmAnalisysBtn();
  });

  Then('I should see the confirmation message', () => {
    locationsPage.elements.titleFinishLegend().should('be.visible');
    locationsPage.elements.subtitleFinishLegend().should('be.visible');
    locationsPage.elements.returnToLocationBtn().should('be.visible');
  });
});
