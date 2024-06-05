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
    descriptionAlertDownloadList: () =>
      cy.contains(
        "You have selected a list file for download. Please check your email for your data's download link."
      ),
    closeAlertDownloadBtn: () => cy.get('[data-cy="download-dialog"]').find('button').first(),
  };

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
