class LocationsPage {
  elements = {
    addLocationsBtn: () => cy.contains('Add locations'),
    addLocationsAlphaBtn: () => cy.get('.side-panel > :nth-child(2) > button'),
    fileUploadBtn: () => cy.get('.upload-location-options__main-content__options > :nth-child(2)'),
    dataTemplatesBtn: () => cy.get('.MuiPaper-root > :nth-child(5)'),
    ShapefileOption: () => cy.contains('Polygon Shapefile'),
    KMLOption: () => cy.get('.css-16a0j3s > :nth-child(2) > .MuiButtonBase-root'),
    SpreadSheetOption: () =>
      cy.get(
        ':nth-child(3) > .MuiButtonBase-root > .MuiAccordionSummary-content > .MuiBox-root > .MuiTypography-root'
      ),
    PointShapefileOption: () => cy.get(':nth-child(4) > .MuiButtonBase-root'),
    ListOfPalmOilOption: () => cy.get(':nth-child(5) > .MuiButtonBase-root'),
    checkBtn: () => cy.get('.MuiAccordionSummary-content > .MuiButtonBase-root'),
    searchInput: () => cy.get('.input-search__input'),
    downloadCSVOptionBtn: () => cy.contains('CSV'),
    MapOptionBtn: () => cy.contains('span[role="menuitem"]', 'Map'),
    downloadShapefileptionBtn: () => cy.contains('Shapefile'),
    downloadTypeDropdown: () => cy.get('#downloadTypeSelect'),
    downloadTemplateBtn: () => cy.contains('Download'),
    downloadTemplateUploadLocationBtn: () =>
      cy.get('.MuiAccordionSummary-content > .MuiButtonBase-root'),
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
  clickOnAddLocationsAlphaBtn() {
    this.elements.addLocationsAlphaBtn().click();
  }
  clickOnfileUploadBtn() {
    this.elements.fileUploadBtn().click();
  }

  clickOndataTemplatesBtn() {
    this.elements.dataTemplatesBtn().click();
  }

  clickOnShapeFileOptionBtn() {
    this.elements.ShapefileOption().click();
  }
  clickOnKMLOptionBtn() {
    this.elements.KMLOption().click();
  }
  clickOnSpreadSheetOptionBtn() {
    this.elements.SpreadSheetOption().click();
  }
  clickOnPointShapefileOptionBtn() {
    this.elements.PointShapefileOption().click();
  }
  clickOnListOfPalmMillOptionBtn() {
    this.elements.ListOfPalmOilOption().click();
  }

  searchLocation(location: string) {
    this.elements.searchInput().type(location);
  }

  clickOnDownloadTemplateBtn() {
    this.elements.downloadTemplateBtn().click();
  }
  clickOnDownloadTemplateUploadLocationBtn() {
    this.elements.downloadTemplateUploadLocationBtn().click();
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
