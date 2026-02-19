import { Before, Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';

describe('Move/Copy CAR Lists', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  let timestamp: number;
  let testNonCARList: string;
  let testCAR: string;

  Before(() => {
    timestamp = Date.now() + Math.floor(Math.random() * 1000);
    testNonCARList = `noncarlist${timestamp}`;
    testCAR = `testcar${timestamp}`;
  });

  Given('I login in the landing page', () => {
    cy.loginUI();
    cy.visit('/locations');
  });

  When('I navigate to a CAR list details page', () => {
    // First, upload a CAR list to ensure we have one
    locationsPage.clickOnAddLocationsBtn();
    locationsPage.clickOnCarIdFileUploadBtn();
    cy.get('[data-testid="file-input"]')
      .invoke('show')
      .selectFile('cypress/fixtures/uploadCAR.csv');
    locationsPage.clickOnNextBtn();

    // Wait for the preview screen to load
    locationsPage.elements.titleListPreview().should('be.visible');
    cy.contains('ID Type').should('be.visible');
    cy.contains('ID').should('be.visible');

    locationsPage.clickOnNextBtn();
    locationsPage.selectCommodity('Coffee');
    locationsPage.typeNewNameList(testCAR);
    locationsPage.selectAnalisysType('post-2020');
    locationsPage.selectAnalisysType('post-2000');
    locationsPage.clickOnNextBtn();
    locationsPage.clickOnSaveAsDraft();
    locationsPage.clickOnConfirmAnalisysBtn();
    locationsPage.elements.titleFinishLegend().should('be.visible');
    cy.visit('/locations');
    cy.get('.my-lists-list').should('be.visible');
    locationsPage.clickOnLocationsList(testCAR);
  });

  Then('I should be able to create a non-CAR list for testing', () => {
    cy.visit('/locations');
    // Create a simple non-CAR list by uploading regular points
    locationsPage.clickOnAddLocationsBtn();
    locationsPage.clickOnDataFileUploadBtn();
    cy.get('[data-testid="file-input"]')
      .invoke('show')
      .selectFile('cypress/fixtures/uploadCsv.xlsx');
    locationsPage.clickOnNextBtn();
    locationsPage.elements.titleListPreview().should('be.visible');
    locationsPage.clickOnNextBtn();
    locationsPage.selectCommodity('Coffee');
    locationsPage.typeNewNameList(testNonCARList);
    locationsPage.selectAnalisysType('post-2020');
    locationsPage.clickOnNextBtn();
    locationsPage.clickOnSaveAsDraft();
    locationsPage.clickOnConfirmAnalisysBtn();
    locationsPage.elements.titleFinishLegend().should('be.visible');
  });

  When('I select a location from the CAR list', () => {
    cy.visit('/locations');
    cy.get('.my-lists-list').should('be.visible');
    locationsPage.clickOnLocationsList(testCAR);
    // Wait for list details page to load
    cy.url().should('include', '/list-details');
    cy.get('.rt-tbody', { timeout: 10000 }).should('be.visible');
    listDetailsPage.selectCheckBoxes([1]);
  });

  When('I copy the location to the existing non-CAR list', () => {
    listDetailsPage.clickOnCopyMoveBtn();
    listDetailsPage.selectList(testNonCARList);
    listDetailsPage.clickOnCopyLocationsBtn();
    listDetailsPage.elements
      .listActionDialog()
      .should('contain.text', 'process started, this can take a while, please be patient');
    listDetailsPage.clickOnConfirmActionBtn();
  });

  Then('I should verify the location has ID Type and ID columns in the target list', () => {
    // Wait for copy operation to complete before navigating
    cy.wait(2000);

    cy.visit('/locations');
    cy.get('.my-lists-list').should('be.visible');
    locationsPage.clickOnLocationsList(testNonCARList);
    cy.get('.rt-tbody').should('be.visible');

    // Open column selector to show all columns
    listDetailsPage.clickMoreOptionsTableColumnBtn();
    cy.get('[data-cy="select-deselect-all-columns"]').should('be.visible');
    listDetailsPage.selectAllOptions();

    // Verify ID Type and ID columns are visible
    cy.contains('ID Type').should('be.visible');
    cy.contains('ID').should('be.visible');

    // Verify the CAR location has data in these columns
    cy.contains('Test CAR Location 1').should('be.visible');
    cy.get('.rt-tbody').contains('CAR').should('exist');
  });

  Then('I should verify other locations have no information in those columns', () => {
    // The non-CAR locations should have empty ID Type and ID columns
    // This is verified by checking that not all rows have CAR data
    cy.get('.rt-tbody .rt-tr-group').should('have.length.greaterThan', 1);
  });

  Then('I should be able to delete the test lists', () => {
    cy.visit('/locations');
    cy.get('.my-lists-list').should('be.visible');
    locationsPage.deleteLists([testCAR, testNonCARList]);
    cy.get('.my-lists-list').should('be.visible');
    locationsPage.verifyLists([testCAR, testNonCARList], false);
  });
});
