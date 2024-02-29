class ListDetailsPage {
  elements = {
    listDiagnosticsBtn: () => cy.get('[data-cy="list-diagnostics"]'),
    fullListMapBtn: () => cy.contains('Full List Map'),
  };

  clickOnListDiagnosticsBtn() {
    this.elements.listDiagnosticsBtn().click();
  }

  clickOnFullListMapBtn() {
    this.elements.fullListMapBtn().click();
  }
}

// module.exports = new ListDetailsPage();
export default ListDetailsPage;
