class LocationsPage {
  elements = {
    languageBtn: () => cy.contains('language'),
    englishBtn: () => cy.contains('English'),
    addLocationsBtn: () => cy.contains('Add locations'),
    searchInput: () => cy.get('.input-search__input'),
    downloadTypeDropdown: () => cy.get('#downloadTypeSelect'),
    downloadBtn: () => cy.contains('Download'),
    locationNameCell: () => cy.get('.rt-td.cell__Location-Name.default-cell'),
    checkbox: () => '.rt-td.td-checkbox',
    downloadBtn2: () => cy.contains('Download…'),
    optionListOK: () =>
      cy
        .get('.my-lists-list li')
        .filter(':not(:has(.failed-tooltip.failed-tooltip--default))')
        .first(),
  };
  clickOnLanguage() {
    this.elements.languageBtn().click();
  }
  selectEnglishLenguage() {
    this.elements.englishBtn().click();
  }
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
  clickOnDownload2() {
    this.elements.downloadBtn2().click();
  }

  clickOnLocationCheckbox(locationName: string) {
    this.elements
      .locationNameCell()
      .contains(new RegExp('^' + locationName + '$'))
      .parents()
      .siblings(this.elements.checkbox())
      .click();
  }
  clickOnOptionListOK() {
    this.elements.optionListOK().click();
  }
  clickOnMoreOptionsListOK() {
    this.elements.optionListOK().find('[title="More"]').click();
  }
}

export default LocationsPage;
