import { Before, After, Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';

describe('Move/Copy UML Lists', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  let timestamp: number;
  let testNonUMLList: string;
  let testUML: string;

  Before(() => {
    timestamp = Date.now() + Math.floor(Math.random() * 1000);
    testNonUMLList = `nonumllist${timestamp}`;
    testUML = `testuml${timestamp}`;
  });

  After(() => {
    // Cleanup test lists if they still exist, even if test fails
    cy.visit('/locations');
    cy.get('body').then(($body) => {
      const listContainer = $body.find('.my-lists-list');
      if (
        listContainer.length &&
        (listContainer.text().includes(testUML) ||
          listContainer.text().includes(testNonUMLList))
      ) {
        locationsPage.deleteLists([testUML, testNonUMLList]);
      }
    });
  });

  Given('I login in the landing page', () => {
    cy.loginUI();
    cy.visit('/locations');
  });

  When('I navigate to a UML list details page', () => {
    // First, upload a UML list to ensure we have one
    locationsPage.clickOnAddLocationsBtn();
    locationsPage.clickOnCarIdFileUploadBtn();
    cy.get('[data-testid="file-input"]')
      .invoke('show')
      .selectFile('cypress/fixtures/uploadUML.csv');
    locationsPage.clickOnNextBtn();

    // Wait for the preview screen to load
    locationsPage.elements.titleListPreview().should('be.visible');
    cy.contains('Palm Mill ID', { timeout: 10000 }).should('be.visible');

    locationsPage.clickOnNextBtn();
    locationsPage.selectCommodity('Coffee');
    locationsPage.typeNewNameList(testUML);
    locationsPage.selectAnalisysType('post-2020');
    locationsPage.selectAnalisysType('post-2000');
    locationsPage.clickOnNextBtn();
    locationsPage.clickOnSaveAsDraft();
    locationsPage.clickOnConfirmAnalisysBtn();
    locationsPage.elements.titleFinishLegend().should('be.visible');
    cy.visit('/locations');
    cy.get('.my-lists-list').should('be.visible');
    cy.contains('.my-lists-list', testUML).should('be.visible');
    locationsPage.clickOnLocationsList(testUML);
  });

  Then('I should be able to create a non-UML list for testing', () => {
    cy.visit('/locations');
    // Create a simple non-UML list by uploading regular points
    locationsPage.clickOnAddLocationsBtn();
    locationsPage.clickOnDataFileUploadBtn();
    cy.get('[data-testid="file-input"]')
      .invoke('show')
      .selectFile('cypress/fixtures/uploadCsv.xlsx');
    locationsPage.clickOnNextBtn();
    locationsPage.elements.titleListPreview().should('be.visible');
    locationsPage.clickOnNextBtn();
    locationsPage.selectCommodity('Coffee');
    locationsPage.typeNewNameList(testNonUMLList);
    locationsPage.selectAnalisysType('post-2020');
    locationsPage.clickOnNextBtn();
    locationsPage.clickOnSaveAsDraft();
    locationsPage.clickOnConfirmAnalisysBtn();
    locationsPage.elements.titleFinishLegend().should('be.visible');
  });

  When('I select a location from the UML list', () => {
    cy.visit('/locations');
    cy.get('.my-lists-list').should('be.visible');
    locationsPage.clickOnLocationsList(testUML);
    // Wait for list details page to load
    cy.url().should('include', '/list-details');
    cy.get('.rt-tbody', { timeout: 10000 }).should('be.visible');
    listDetailsPage.selectCheckBoxes([1]);
  });

  When('I copy the location to the existing non-UML list', () => {
    listDetailsPage.clickOnCopyMoveBtn();
    listDetailsPage.selectList(testNonUMLList);
    listDetailsPage.clickOnCopyLocationsBtn();
    listDetailsPage.elements
      .listActionDialog()
      .should('contain.text', 'process started, this can take a while, please be patient');
    listDetailsPage.clickOnConfirmActionBtn();
  });

  Then('I should verify the location has Palm Mill ID column in the target list', () => {
    cy.visit('/locations');
    cy.get('.my-lists-list').should('be.visible');
    locationsPage.clickOnLocationsList(testNonUMLList);
    cy.get('.rt-tbody').should('be.visible');

    // Open column selector to show all columns
    listDetailsPage.clickMoreOptionsTableColumnBtn();
    cy.get('[data-cy="select-deselect-all-columns"]').should('be.visible');
    listDetailsPage.selectAllOptions();

    // Verify Palm Mill ID column is visible (UML lists use Palm Mill ID, not ID Type)
    cy.contains('Palm Mill ID', { timeout: 10000 }).should('be.visible');

    // Verify the UML location has data in these columns (with longer timeout for async copy)
    cy.contains('Test UML Mill 1', { timeout: 15000 }).should('be.visible');
    cy.get('.rt-tbody', { timeout: 15000 }).contains('PO1000000065').should('exist');
  });

  Then('I should verify other locations have no information in those columns', () => {
    // The non-UML locations should have empty Palm Mill ID column,
    // while the copied UML location should have a non-empty Palm Mill ID.
    // First, find the index of the "Palm Mill ID" column.
    cy.get('.rt-thead .rt-th').then(($headers) => {
      const palmMillIndex = Cypress._.findIndex(
        $headers,
        (h) => h.innerText.trim() === 'Palm Mill ID'
      );

      // Ensure the Palm Mill ID column exists.
      expect(palmMillIndex).to.be.greaterThan(-1);

      // Ensure there is more than one row (UML + non-UML locations).
      cy.get('.rt-tbody .rt-tr-group').should('have.length.greaterThan', 1);

      // Now verify Palm Mill ID cell values for UML vs non-UML rows.
      cy.get('.rt-tbody .rt-tr-group').then(($rows) => {
        const rows = Cypress.$($rows).toArray();
        let nonEmptyPalmCount = 0;

        rows.forEach((row) => {
          const $row = Cypress.$(row);
          const cells = $row.find('.rt-td');
          const palmCell = Cypress.$(cells.get(palmMillIndex));
          const palmText = palmCell.text().trim();

          if (palmText === '') {
            // Original non-UML locations should have an empty Palm Mill ID.
            expect(palmText).to.equal('');
          } else {
            // Copied UML location(s) should have Palm Mill ID populated.
            nonEmptyPalmCount += 1;
          }
        });

        // There should be exactly one UML location with a non-empty Palm Mill ID.
        expect(nonEmptyPalmCount).to.equal(1);
      });
    });
  });
});
