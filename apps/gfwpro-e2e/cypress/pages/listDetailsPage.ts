class ListDetailsPage {
  elements = {
    listDiagnosticsBtn: () => cy.get('[data-cy="list-diagnostics"]'),
    locationDiagnosticsBtn: () => cy.get('[data-cy="location-diagnostics"]'),
    fullListMapBtn: () => cy.contains('Full List Map'),
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
}

export default ListDetailsPage;
