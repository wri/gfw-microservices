class ListDetailsPage {
  elements = {
    listDiagnosticsBtn: () => cy.get('[data-cy="list-diagnostics"]'),
    locationDiagnosticsBtnOnHover: () => cy.get('[data-cy="location-diagnostics"]'),
    fullListMapBtn: () => cy.contains('List Map'),
    locationMapBtnOnHover: () => cy.get('[data-cy="locations-map"]'),
    locationMapBtn: () => cy.contains('Location(s) Map'),
    checkBoxSelectAll: () => cy.get('[data-cy="select-all-locations"]'),
    checkBoxSelectLocation: (name: string) => cy.contains(name),
    downloadBtn: () => cy.contains('Download'),
    downloadCSVOptionListDetail: () => cy.contains('CSV'),
    downloadResultsOptionListDetail: () => cy.contains('Results'),
    downloadShapefileptionListDetail: () => cy.contains('Shapefile'),
    titleAlertDownloadList: () => cy.contains('List file Download'),
    copyMoveBtn: () => cy.contains('Copy/Move'),
    copyBtn: () => cy.get('.MuiButton-primary'),
    deleteBtn: () => cy.contains('Delete'),
    createNewListText: () => cy.contains('Create new'),
    createNewListOptionRadioBtn: () => cy.get('.move-or-copy__option').last().find('input'),
    moveSectionOptionRadioBtn: () => cy.contains('label', 'Move'),
    inputCreateNewList: () => cy.get('[id="new-list-name"]'),
    submitBtn: () => cy.contains('Submit Analysis'),
    copyLocationsBtn: () => cy.contains('button', /^Copy Location\(s\)$/),
    moveLocationsBtn: () => cy.contains('button', /^Move Location\(s\)$/),
    confirmActionBtn: () => cy.contains('button', 'OK'),
    apply: () => cy.contains('Apply'),
    descriptionAlertDownloadList: () =>
      cy.contains(
        "You have selected a list file for download. Please check your email for your data's download link."
      ),
    closeAlertDownloadBtn: () =>
      cy.get('[data-cy="download-dialog"]').parent().find('[data-testid="CloseIcon"]'),
    listByName: (name: string) => cy.contains('.list-item', name),
    post2020Tab: () => cy.get('[data-cy="post-2020-tab"]'),
    post2000Tab: () => cy.get('[data-cy="post-2000-tab"]'),
    palmRiskAssessmentTab: () => cy.get('[data-cy="palm-risk-assessment-tab"]'),
    alertsTab: () => cy.get('[data-cy="alerts-tab"]'),
    hiddenElement: () => cy.get('.rt-tr-group').eq(0).find('.rt-td.default-cell.td-num').last(),
    moreOptionsBtn: () => cy.get('[data-cy="row-more-options-button"]').eq(0),
    moreOptionsTableColumnBtn: () => cy.get('[data-testid="MoreVertIcon"]'),
    allColumnsCheckbox: () => cy.get('[data-cy="select-deselect-all-columns"]'),
    columnAttributes: () =>
      cy.get(
        '[data-cy^="column-selector-"]:not([data-cy="column-selector-button"]), [data-cy="select-deselect-all-columns"]'
      ),
    columnHeaders: () => cy.get('.title-text'),
    listActionDialog: () => cy.get('.list-diagnostics-dialog'),
    visibleListActionDialog: () => cy.get('.list-diagnostics-dialog:visible'),
    tableRow: () => cy.get('.rt-tbody').find('[data-testid="custom-row"]'),
    gridCell: () => cy.get('[role="gridcell"]'),
    alertsLandCoverSelect: () => cy.get('[data-cy="alerts-land-cover-select"]'),
  };
  clickOnLocationsList(name: string) {
    cy.contains(name).click();
  }

  selectCountryForProtectedAreas(location: string) {
    cy.get('#country_select').click();
    cy.contains(location).should('be.visible').click();
  }
  selectCountryForAdminAreas(location: string) {
    cy.get('#country_select').click();
    cy.contains(location).should('be.visible').click();
  }

  clickOnApply() {
    this.elements.apply().click();
  }
  selectCheckBoxes(locations: number[]) {
    if (locations && locations.length > 0) {
      locations.forEach((location) => {
        cy.get('div.rt-table')
          .find('[data-cy^="select-location-"]:visible')
          .eq(location - 1)
          .find('input[type="checkbox"]')
          .click({ force: true });
      });
    }
  }

  selectLocationOnList(location: string) {
    this.elements.checkBoxSelectLocation(location).find('input').click();
  }
  verifyLocations(location: string, exist: boolean) {
    const element = this.elements.checkBoxSelectLocation(location);
    if (exist) {
      element.should('be.visible');
    } else {
      element.should('not.be.visible');
    }
  }

  moveList(list: string, location: number[]) {
    const minRows = Math.max(...location);
    cy.get('div.rt-table', { timeout: 60000 })
      .find('[data-cy^="select-location-"]', { timeout: 60000 })
      .should('have.length.at.least', minRows);
    this.selectCheckBoxes(location);
    this.clickOnCopyMoveBtn();
    this.clickOnMoveSectionRadioBtn();
    this.selectList(list);
    this.clickOnMoveLocationsBtn();
    this.elements
      .listActionDialog()
      .should('contain.text', 'process started, this can take a while, please be patient');
    this.elements.confirmActionBtn().should('be.visible');
    this.clickOnConfirmActionBtn();
  }

  deleteLocations(lists: string[]) {
    lists.forEach((listName) => {
      cy.get('ul.my-lists-list').then(($ul) => {
        if ($ul.find(`li:contains(${listName})`).length > 0) {
          this.clickOnLocationsList(listName);
          this.checkOnCheckBoxSelectAll();
          this.clickOnDeleteBtn();
          this.elements.confirmActionBtn().should('be.visible');
          this.clickOnConfirmActionBtn();
        }
      });
    });
  }

  copyLists(lists: string[], locations?: number[], isGFW?: boolean) {
    lists.forEach((listName) => {
      if (locations && locations.length > 0) {
        locations.forEach((location) => {
          cy.get('div.rt-table')
            .find('[data-cy^="select-location-"]:visible')
            .eq(location - 1)
            .find('input[type="checkbox"]')
            .click({ force: true });
        });
      } else {
        this.checkOnCheckBoxSelectAll();
      }
      if (isGFW) {
        this.clickOnCopyBtn();
      } else {
        this.clickOnCopyMoveBtn();
      }
      this.elements.visibleListActionDialog().contains('Create new').should('be.visible');
      this.clickOnCreateNewListRadioBtn();
      cy.get('#new-selection').should('be.checked');
      this.elements.inputCreateNewList().should('be.visible').clear().type(listName);

      // Verify the input has the correct value
      this.elements.inputCreateNewList().should('have.value', listName);
      // Blur to commit the input interaction before submit.
      this.elements.inputCreateNewList().blur();
      // updateNewListName is debounced in the app; allow state to settle before submit.
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(250);
      cy.get('#new-selection').should('be.checked');

      // Debug: Log basic information
      cy.log('Checking Save As Draft button state...');
      cy.log(`List name entered: ${listName}`);

      // Check if there are any validation error messages
      cy.get('body').then(($body) => {
        if ($body.find('.error-message, .validation-error, [role="alert"]').length > 0) {
          cy.log('Found validation errors:');
          cy.get('.error-message, .validation-error, [role="alert"]').each(($error) => {
            cy.log(`Error: ${$error.text()}`);
          });
        }
      });

      // Now try to click the Save As Draft button
      this.clickOnCopyLocationsBtn();
      if (isGFW) {
        const listActionDialogSelector = '.list-diagnostics-dialog';

        // In CI the first submit click can occasionally be dropped while the modal
        // is still settling. If the copy form is still visible, submit once more.
        this.elements.visibleListActionDialog().then(($dialog) => {
          if ($dialog.text().includes('Copy selection')) {
            this.clickOnCopyLocationsBtn();
          }
        });
        cy.contains(listActionDialogSelector, 'Locations Added', { timeout: 120000 }).should(
          'be.visible'
        );
        cy.contains(
          listActionDialogSelector,
          `You have successfully added locations and saved ${listName} as a draft`,
          { timeout: 120000 }
        ).should('be.visible');
      } else {
        const listActionDialogSelector = '.list-diagnostics-dialog';

        // In CI the first submit click can occasionally be dropped while the modal
        // is still settling. If we are still on the copy form, submit once more.
        this.elements.visibleListActionDialog().then(($dialog) => {
          const dialogText = $dialog.text().toLowerCase();
          if (dialogText.includes('selected location') && dialogText.includes('copy')) {
            this.clickOnCopyLocationsBtn();
          }
        });

        cy.contains(
          listActionDialogSelector,
          'process started, this can take a while, please be patient',
          { timeout: 120000 }
        ).should('be.visible');
      }
      this.elements.confirmActionBtn().should('be.visible');
      this.clickOnConfirmActionBtn();
    });
  }

  selectList(list: string) {
    cy.get('div.move-to-list-select select').select(list);
  }
  clickOnCopyLocationsBtn() {
    this.elements
      .visibleListActionDialog()
      .contains('button', /^Copy Location\(s\)$/)
      .should('be.visible')
      .and('not.be.disabled')
      .scrollIntoView()
      .click({ force: true });
  }
  clickOnMoveLocationsBtn() {
    this.elements
      .moveLocationsBtn()
      .should('be.visible')
      .and('not.be.disabled')
      .scrollIntoView()
      .click();
  }
  clickOnSubmitBtn() {
    this.elements.submitBtn().click();
  }
  clickOnConfirmActionBtn() {
    this.elements.confirmActionBtn().click();
  }

  clickOnMoveSectionRadioBtn() {
    this.elements.moveSectionOptionRadioBtn().click({ force: true });
  }
  clickOnCreateNewListRadioBtn() {
    this.elements.visibleListActionDialog().find('#new-selection').click({ force: true });
  }
  clickOnCopyMoveBtn() {
    this.elements.copyMoveBtn().click();
  }
  clickOnCopyBtn() {
    this.elements.copyBtn().click();
  }
  clickOnDeleteBtn() {
    this.elements.deleteBtn().click();
  }
  clickOnPost2020Tab() {
    this.elements.post2020Tab().click();
  }
  clickOnPost2000Tab() {
    this.elements.post2000Tab().click();
  }
  clickOnPalmRiskAssessmentTab() {
    this.elements.palmRiskAssessmentTab().click();
  }
  clickOnAlertsTab() {
    this.elements.alertsTab().click();
  }
  clickOnListDiagnosticsBtn() {
    this.elements.listDiagnosticsBtn().click();
  }

  clickOnLocationDiagnosticsBtnOnHover() {
    cy.get('[data-testid="custom-row"]')
      .eq(2)
      .children('[role="gridcell"]')
      .eq(4)
      .trigger('mouseover');
    this.elements.locationDiagnosticsBtnOnHover().first().click();
  }

  clickOnFullListMapBtn() {
    this.elements.fullListMapBtn().click();
  }
  clickOnLocationMapBtnOnHover() {
    cy.get('[data-testid="custom-row"]')
      .eq(2)
      .children('[role="gridcell"]')
      .eq(4)
      .trigger('mouseover');
    this.elements.locationMapBtnOnHover().click();
  }
  clickOnLocationMapBtn() {
    this.elements.locationMapBtn().click();
  }
  checkOnCheckBoxSelectAll() {
    this.elements.checkBoxSelectAll().click();
  }
  clickOnDownload() {
    this.elements.downloadBtn().click();
  }
  clickOnCSVOption() {
    this.elements.downloadCSVOptionListDetail().click();
  }
  clickOnShapefileOption() {
    this.elements.downloadShapefileptionListDetail().click();
  }
  openAlertsLandCoverSelect() {
    this.elements.alertsLandCoverSelect().click();
  }
  selectAlertsLandCoverOption(option: string) {
    this.openAlertsLandCoverSelect();
    cy.contains('li[role="option"]', option).click();
  }
  clickCloseAlertDownload() {
    this.elements.closeAlertDownloadBtn().click();
  }
  clickMoreOptionsTableColumnBtn() {
    this.elements.moreOptionsTableColumnBtn().click();
  }
  getAllOptions() {
    return this.elements.columnAttributes().parent().invoke('text');
  }
  getAllOptionsCount() {
    return this.elements.columnAttributes().its('length');
  }
  getAllColumnsHeadersCount() {
    return this.elements.columnHeaders().its('length');
  }
  selectAllOptions() {
    this.elements.allColumnsCheckbox().click();
  }
  getTableRowCount() {
    return this.elements.tableRow().its('length');
  }
  getDotsCount() {
    return this.elements
      .tableRow()
      .get('[role="gridcell"]')
      .find('svg[class="list-icons"]')
      .its('length');
  }
  sanitizeColumnLabel(label: string) {
    return label.replace(/\s+/g, '-');
  }
  getColumnHeader(label: string) {
    return cy.get(`[data-cy="column-header-${this.sanitizeColumnLabel(label)}"]`);
  }
  findColumnHeader(label: string) {
    return cy.get('body').find(`[data-cy="column-header-${this.sanitizeColumnLabel(label)}"]`);
  }
  validateLocationColumn() {
    this.elements.tableRow().each((row, index) => {
      cy.wrap(row).within(() => {
        this.elements
          .gridCell()
          .eq(1)
          .invoke('text')
          .then((text) => {
            const trimmedText = text.trim();
            expect(trimmedText, `Row ${index + 1}, column 2 should not be empty`).to.not.be.empty;
            cy.log(`Row ${index + 1}: "${trimmedText}"`);
          });
      });
    });
  }
  validateMillPriorityAndOverallThreatsAndValues() {
    this.elements.tableRow().each(($row, index) => {
      cy.wrap($row).within(() => {
        this.elements
          .gridCell()
          .eq(2)
          .find('.list-analysis-text')
          .invoke('text')
          .then((text) => {
            const trimmedText = text.trim();
            const validValues = ['Low', 'Med', 'High'];
            expect(
              validValues.includes(trimmedText),
              `Row ${
                index + 1
              }, Mill Priority column should be Low, Med, or High, got "${trimmedText}"`
            ).to.be.true;
            cy.log(`Row ${index + 1}, Mill Priority Column: "${trimmedText}"`);
          });

        this.elements
          .gridCell()
          .eq(7)
          .find('.list-analysis-text')
          .invoke('text')
          .then((text) => {
            const trimmedText = text.trim();
            const validValues = ['Low', 'Med', 'High'];
            expect(
              validValues.includes(trimmedText),
              `Row ${
                index + 1
              }, Overal Threats column should be Low, Med, or High, got "${trimmedText}"`
            ).to.be.true;
            cy.log(`Row ${index + 1}, Overal Threats Column: "${trimmedText}"`);
          });

        this.elements
          .gridCell()
          .eq(11)
          .find('.list-analysis-text')
          .invoke('text')
          .then((text) => {
            const trimmedText = text.trim();
            const validValues = ['Low', 'Med', 'High'];
            expect(
              validValues.includes(trimmedText),
              `Row ${
                index + 1
              }, Overal Values column should be Low, Med, or High, got "${trimmedText}"`
            ).to.be.true;
            cy.log(`Row ${index + 1}, Overal Values Column: "${trimmedText}"`);
          });
      });
    });
  }
}

export default ListDetailsPage;
