import { Before, Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';

describe('Upload CAR File', () => {
  const filePath = 'cypress/fixtures/uploadCAR.csv';
  let timestamp: number;
  let listToUploadCAR: string;
  const locationsPage = new LocationsPage();

  Before(() => {
    timestamp = Date.now() + Math.floor(Math.random() * 1000);
    listToUploadCAR = `uploadcar${timestamp}`;
  });

  Given('I login in the landing page', () => {
    cy.loginUI();
  });

  When('I navigate to the Locations page', () => {
    cy.visit('/locations');
  });

  When('I click on the Add Locations button', () => {
    locationsPage.clickOnAddLocationsBtn();
  });

  When('I select the CAR ID file upload option', () => {
    locationsPage.clickOnCarIdFileUploadBtn();
  });

  When('I click on the Drop file button and drag a CAR CSV file', () => {
    cy.get('[data-testid="file-input"]').invoke('show').selectFile(filePath);
    locationsPage.clickOnNextBtn();
  });

  Then('I should see the CAR list preview with ID Type and ID columns', () => {
    locationsPage.elements.titleListPreview().should('be.visible');
    locationsPage.elements.backBtn().should('be.visible');
    locationsPage.elements.cancelBtn().should('be.visible');
    locationsPage.elements.locationNameColumn().should('be.visible');

    // Verify CAR-specific columns are present
    cy.contains('ID Type').should('be.visible');
    cy.contains('ID').should('be.visible');

    // Verify the data is displayed correctly
    cy.contains('Test CAR Location 1').should('be.visible');
    cy.contains('CAR').should('be.visible');

    // Verify that the actual ID value from the CSV is displayed in the preview
    cy.readFile(filePath).then((csvContent: string) => {
      const lines = csvContent.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('uploadCAR.csv does not contain any data rows');
      }

      const headers = lines[0].split(',');
      const idIndex = headers.indexOf('ID');
      if (idIndex === -1) {
        throw new Error('uploadCAR.csv does not contain an "ID" column');
      }

      const firstDataRow = lines[1].split(',');
      const idValue = firstDataRow[idIndex].replace(/^\s*"|"\s*$/g, '');

      cy.contains(idValue).should('be.visible');
    });

    locationsPage.clickOnNextBtn();
  });

  Then('I complete the CAR form and confirm the upload', () => {
    locationsPage.selectCommodity('Coffee');
    locationsPage.typeNewNameList(listToUploadCAR);
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
