import { Before, Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';

describe('Upload UML File', () => {
  const filePath = 'cypress/fixtures/uploadUML.csv';
  let timestamp: number;
  let listToUploadUML: string;
  const locationsPage = new LocationsPage();

  Before(() => {
    timestamp = Date.now() + Math.floor(Math.random() * 1000);
    listToUploadUML = `uploaduml${timestamp}`;
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
    // For UML, we also use the "By ID" upload option
    locationsPage.clickOnCarIdFileUploadBtn();
  });

  When('I click on the Drop file button and drag a UML CSV file', () => {
    cy.get('[data-testid="file-input"]').invoke('show').selectFile(filePath);
    locationsPage.clickOnNextBtn();
  });

  Then('I should see the UML list preview with Palm Mill ID and Analysis Radius columns', () => {
    // Wait for the preview screen to load
    locationsPage.elements.titleListPreview().should('be.visible');

    locationsPage.elements.backBtn().should('be.visible');
    locationsPage.elements.cancelBtn().should('be.visible');
    locationsPage.elements.locationNameColumn().should('be.visible');

    // Verify UML-specific columns are present
    cy.contains('Palm Mill ID', { timeout: 10000 }).should('be.visible');
    cy.contains('Analysis Radius').should('be.visible');

    // Verify the data is displayed correctly
    cy.contains('Test UML Mill 1').should('be.visible');
    cy.contains('PO1000000065').should('be.visible');

    locationsPage.clickOnNextBtn();
  });

  Then('I complete the UML form and confirm the upload', () => {
    locationsPage.selectCommodity('Coffee');
    locationsPage.typeNewNameList(listToUploadUML);
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
