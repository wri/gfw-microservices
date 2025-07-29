class ListDetailsPage {
  elements = {
    listDiagnosticsBtn: () => cy.get('[data-cy="list-diagnostics"]'),
    locationDiagnosticsBtnOnHover: () => cy.get('[data-cy="location-diagnostics"]'),
    fullListMapBtn: () => cy.contains('List Map'),
    locationMapBtnOnHover: () => cy.get('[data-cy="locations-map"]'),
    locationMapBtn: () => cy.contains('Location(s) Map'),
    checkBoxSelectAll: () => cy.get('div.rt-table').find('label.column-checkbox:visible').eq(0),
    checkBoxSelectLocation: (name) => cy.contains(name),
    downloadBtn: () => cy.contains('Download'),
    downloadCSVOptionListDetail: () => cy.contains('CSV'),
    downloadResultsOptionListDetail: () => cy.contains('Results'),
    downloadShapefileptionListDetail: () => cy.contains('Shapefile'),
    titleAlertDownloadList: () => cy.contains('List file Download'),
    copyMoveBtn: () => cy.contains('Copy/Move'),
    copyBtn: () => cy.get('.MuiButton-primary'),
    editBtn: () => cy.contains('EDIT'),
    deleteBtn: () => cy.contains('Delete'),
    createNewListText: () => cy.contains('Create new'),
    createNewListOptionRadioBtn: () => cy.get('.move-or-copy__option').last().find('input'),
    moveSectionOptionRadioBtn: () => cy.contains('label', 'Move'),
    inputCreateNewList: () => cy.get('[id="new-list-name"]'),
    submitBtn: () => cy.contains('Submit Analysis'),
    saveAsDraftBtn: () => cy.contains('Save As Draft'),
    confirmActionBtn: () => cy.contains('button', 'OK'),
    titleConfirmCopyList: () => cy.contains('h3', 'Locations Moved'),
    apply: () => cy.contains('Apply'),
    descriptionConfirmCopyList: () =>
      cy.contains('div', 'Location move process starts, this can take a while, please be patient.'),
    descriptionAlertDownloadList: () =>
      cy.contains(
        "You have selected a list file for download. Please check your email for your data's download link."
      ),
    closeAlertDownloadBtn: () =>
      cy.get('[data-cy="download-dialog"]').parent().find('[data-testid="CloseIcon"]'),
    listByName: (name) => cy.contains('.list-item', name),
    post2020Tab: () => cy.get('[data-cy="post-2020-tab"]'),
    post2000Tab: () => cy.get('[data-cy="post-2000-tab"]'),
    palmRiskAssessmentTab: () => cy.get('[data-cy="palm-risk-assessment-tab"]'),
    hiddenElement: () => cy.get('.rt-tr-group').eq(0).find('.rt-td.default-cell.td-num').last(),
    moreOptionsBtn: () => cy.get('[data-cy="row-more-options-button"]').eq(0),
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
          .find('label.column-checkbox.column-checkbox-single:visible')
          .eq(location - 1)
          .click();
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
    this.selectCheckBoxes(location);
    this.clickOnCopyMoveBtn();
    this.clickOnMoveSectionRadioBtn();
    this.selectList(list);
    this.clickOnSaveAsDraftBtn();
    this.elements.titleConfirmCopyList().should('be.visible');
    this.elements.descriptionConfirmCopyList().should('be.visible');
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
            .find('label.column-checkbox.column-checkbox-single:visible')
            .eq(location - 1)
            .click();
        });
      } else {
        this.checkOnCheckBoxSelectAll();
      }
      if (isGFW) {
        this.clickOnCopyBtn();
      } else {
        this.clickOnCopyMoveBtn();
      }
      this.elements.createNewListText().should('be.visible');
      this.clickOnCreateNewListRadioBtn();
      this.elements.inputCreateNewList().type(listName);
      this.clickOnSaveAsDraftBtn();

      this.elements.confirmActionBtn().should('be.visible');
      this.clickOnConfirmActionBtn();
    });
  }

  selectList(list) {
    cy.get('div.move-to-list-select select').select(list);
  }
  clickOnSaveAsDraftBtn() {
    this.elements.saveAsDraftBtn().should('be.visible').click();
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
    this.elements.createNewListOptionRadioBtn().click({ force: true });
  }
  clickOnCopyMoveBtn() {
    this.elements.copyMoveBtn().click();
  }
  clickOnCopyBtn() {
    this.elements.copyBtn().click();
  }
  clickOnEditBtn() {
    this.elements.hiddenElement().trigger('mouseover');
    this.elements.moreOptionsBtn().click();
    this.elements.editBtn().click();
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
  clickOnListDiagnosticsBtn() {
    this.elements.listDiagnosticsBtn().click();
  }

  clickOnLocationDiagnosticsBtnOnHover() {
    cy.get('[data-testid="custom-row"]')
      .eq(2)
      .children('[role="gridcell"]')
      .eq(4)
      .trigger('mouseover');
    this.elements.locationDiagnosticsBtnOnHover().click();
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
  clickCloseAlertDownload() {
    this.elements.closeAlertDownloadBtn().click();
  }
}

export default ListDetailsPage;
