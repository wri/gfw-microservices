class ListDetailsPage {
  elements = {
    listDiagnosticsBtn: () => cy.get('[data-cy="list-diagnostics"]'),
    locationDiagnosticsBtn: () => cy.get('[data-cy="location-diagnostics"]'),
    fullListMapBtn: () => cy.contains('List Map'),
    mapBtn: () => cy.contains('Map'),
    locationMapBtn: () => cy.contains('Location(s) Map'),
    checkBoxSelectAll: () => cy.get('div.rt-table').find('label.column-checkbox:visible').eq(0),
    checkBoxSelectLocation: (name) => cy.contains(name),
    downloadBtn: () => cy.contains('Download'),
    downloadCSVOptionListDetail: () => cy.contains('CSV'),
    downloadResultsOptionListDetail: () => cy.contains('Results'),
    downloadShapefileptionListDetail: () => cy.contains('Shapefile'),
    titleAlertDownloadList: () => cy.contains('List file Download'),
    copyMoveBtn: () => cy.contains('Copy/Move'),
    editBtn: () => cy.contains('EDIT'),
    deleteBtn: () => cy.contains('Delete'),
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
    closeAlertDownloadBtn: () => cy.get('[data-cy="download-dialog"]').find('button').first(),
    listByName: (name) => cy.contains('.list-item', name),
    post2020Tab: () => cy.get('[data-cy="post-2020-tab"]'),
    post2000Tab: () => cy.get('[data-cy="post-2000-tab"]'),
    palmRiskAssessmentTab: () => cy.get('[data-cy="palm-risk-assessment-tab"]'),
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

  copyLists(lists: string[], locations?: number[]) {
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

      this.clickOnCopyMoveBtn();
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
  clickOnEditBtn() {
    cy.get(
      '.rt-tbody > :nth-child(1) > [style="width: 100%; display: flex;"] > :nth-child(6)'
    ).trigger('mouseover');
    cy.get(
      '[style="position: absolute; right: 0px; background-color: white; padding: 0px 20px;"] > .css-gggkt8-MuiButtonBase-root-MuiButton-root > [data-testid="MoreVertIcon"]'
    ).click();
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

  clickOnLocationDiagnosticsBtn() {
    cy.get(':nth-child(1) > [style="width: 100%; display: flex;"] > :nth-child(6) > span').trigger(
      'mouseover'
    );
    this.elements.locationDiagnosticsBtn().click();
  }

  clickOnFullListMapBtn() {
    this.elements.fullListMapBtn().click();
  }
  clickOnMapBtn() {
    cy.get(':nth-child(1) > [style="width: 100%; display: flex;"] > :nth-child(6) > span').trigger(
      'mouseover'
    );
    this.elements.mapBtn().click();
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
