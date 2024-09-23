class LocationsPage {
  elements = {
    addLocationsBtn: () => cy.contains('Add locations'),
    searchInput: () => cy.get('.input-search__input'),
    downloadCSVOptionBtn: () => cy.contains('CSV'),
    MapOptionBtn: () => cy.contains('span[role="menuitem"]', 'Map'),
    downloadShapefileptionBtn: () => cy.contains('Shapefile'),
    downloadTypeDropdown: () => cy.get('#downloadTypeSelect'),
    downloadTemplateBtn: () => cy.contains('Download'),
    locationNameCell: () => cy.get('.rt-td.cell__Location-Name.default-cell'),
    checkbox: () => '.rt-td.td-checkbox',
    downloadListBtn: () => cy.contains('Download…'),
    confirmActionBtn: () => cy.contains('button', 'OK'),
    optionListOK: () =>
      cy
        .get('.my-lists-list li')
        .filter(':not(:has(.failed-tooltip.failed-tooltip--default))')
        .first(),
    optionListDraft: () =>
      cy.get('.my-lists-list li').filter(':has(.DiagnosticStatusDraft__label)').first(),
    listByName: (name) => cy.contains(name),
  };

  verifyLists(lists: string[], exist: boolean) {
    lists.forEach((listName) => {
      const element = this.elements.listByName(listName);
      if (exist) {
        element.should('be.visible');
      } else {
        element.should('not.exist');
      }
    });
  }

  deleteLists(lists: string[]) {
    lists.forEach((listName) => {
      cy.get('ul.my-lists-list')
        .contains('li', listName)
        .find('button[title="More"].icon-button')
        .click();
      this.clickOnDeleteList();
      this.elements.confirmActionBtn().should('be.visible');
      this.clickOnConfirmActionBtn();
    });
  }

  clickOnConfirmActionBtn() {
    this.elements.confirmActionBtn().click();
  }

  clickOnMapBtn() {
    this.elements.MapOptionBtn().click();
  }
  clickOnDeleteList() {
    cy.contains('Delete').click();
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
    this.elements.downloadTemplateBtn().click();
  }
  clickOnDownloadList() {
    this.elements.downloadListBtn().click();
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
  clickOnMoreOptionsList(list: string) {
    cy.contains('li.locations-list', list).within(() => {
      cy.get('button[title="More"]').click();
    });
  }
}

export default LocationsPage;
