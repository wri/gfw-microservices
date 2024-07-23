class ListDetailsPage {
  elements = {
    listDiagnosticsBtn: () => cy.get('[data-cy="list-diagnostics"]'),
    locationDiagnosticsBtn: () => cy.get('[data-cy="location-diagnostics"]'),
    fullListMapBtn: () => cy.contains('Full List Map'),
    checkBoxSelectAll: () => cy.get('[for="column-checkbox-all"]'),
    downloadBtn: () => cy.contains('Download'),
    downloadCSVOptionBtn: () => cy.contains('CSV'),
    downloadResultsOptionBtn: () => cy.contains('Results'),
    downloadShapefileptionBtn: () => cy.contains('Shapefile'),
    titleAlertDownloadList: () => cy.contains('List file Download'),
    moveBtn: () => cy.contains('Move'),
    deleteBtn: () => cy.contains('Delete'),
    createNewListOptionRadioBtn: () => cy.get('.move-or-copy__option').last().find('input'),
    moveSectionOptionRadioBtn: () => cy.contains('label', 'Move'),
    inputCreateNewList: () => cy.get('[id="new-list-name"]'),
    submitBtn: () => cy.contains('Submit Analysis'),
    saveAsDraftBtn: () => cy.contains('Save As Draft'),
    confirmActionBtn: () => cy.contains('button', 'OK'),
    titleConfirmCopyList: () => cy.contains('h3', 'Locations Moved'),
    descriptionConfirmCopyList: () =>
      cy.contains('div', 'Location move process starts, this can take a while, please be patient.'),
    descriptionAlertDownloadList: () =>
      cy.contains(
        "You have selected a list file for download. Please check your email for your data's download link."
      ),
    closeAlertDownloadBtn: () => cy.get('[data-cy="download-dialog"]').find('button').first(),
  };

  selectList(list) {
    cy.get('div.move-to-list-select select').select(list);
  }
  clickOnSaveAsDraftBtn() {
    this.elements.saveAsDraftBtn().click();
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
  clickOnMoveBtn() {
    this.elements.moveBtn().click();
  }
  clickOnDeleteBtn() {
    this.elements.deleteBtn().click();
  }
  clickOnListDiagnosticsBtn() {
    this.elements.listDiagnosticsBtn().click();
  }

  clickOnLocationDiagnosticsBtn() {
    this.elements.locationDiagnosticsBtn().click();
  }

  clickOnFullListMapBtn() {
    this.elements.fullListMapBtn().click();
  }
  clickOnCheckBoxSelectAll() {
    this.elements.checkBoxSelectAll().click();
  }
  clickOnDownload() {
    this.elements.downloadBtn().click();
  }
  clickOnResultsOption() {
    this.elements.downloadResultsOptionBtn().click();
  }
  clickOnCSVOption() {
    this.elements.downloadCSVOptionBtn().click();
  }
  clickOnShapefileOption() {
    this.elements.downloadShapefileptionBtn().click();
  }
  clickCloseAlertDownload() {
    this.elements.closeAlertDownloadBtn().click();
  }
}

export default ListDetailsPage;
