class LocationsPage {
  elements = {
    addLocationsBtn: () => cy.contains('Add locations'),
    searchInput: () => cy.get('.input-search__input'),
    downloadTypeDropdown: () => cy.get('#downloadTypeSelect'),
    downloadBtn: () => cy.contains('Download'),
    checkbox: () => cy.get('.rt-td.td-checkbox'),
  };

  clickOnLocationsList(name: string) {
    cy.contains(name).click();
  }

  clickOnAddLocationsBtn() {
    this.elements.addLocationsBtn().click();
  }

  searchLocation(location: string) {
    this.elements.searchInput().type(location);
  }

  clickOnDownloadTemplateBtn() {
    this.elements.downloadBtn().click();
  }

  clickOnLocationCheckbox() {
    this.elements.checkbox().eq(2).click();
  }
}

export default LocationsPage;
