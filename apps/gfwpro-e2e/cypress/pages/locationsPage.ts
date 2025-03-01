class LocationsPage {
  elements = {
    singleLocationBtn: () => cy.get('#AddSingleLocation'),
    continueBtn: () => cy.contains('Continue'),
    comodityBtn: () => cy.get('.commodity-option-label'),
    cattleGenericOptionBtn: () =>
      cy.get('.locations-upload-step__suboptions-container > :nth-child(3) > label'),
    addListToExistingBtn: () => cy.get('.locations-adding > :nth-child(2) > :nth-child(1) > label'),
    selectExistingList: (name) => cy.get('#add-to-existing-list').select(name),
    drawAShapeBtn: () => cy.get(':nth-child(2) > .add-location-method__label'),
    addCoordinatesBtn: () => cy.get('[data-testid="AddLocationIcon"]'),
    longitudeCoordinate: () => cy.get('[data-testid="longitude-input-0"]'),
    latitudeCoordinate: () => cy.get('[data-testid="latitude-input-0"]'),
    locationClassification: () => cy.get('.block-label > .dropdown-group > select').eq(0),
    locationName: () => cy.get('#location-name'),
    titleAddedLocation: () => cy.contains('Location Added'),
    descriptionAddedLocation: (nameList) =>
      cy.contains(`You have successfully added location to ${nameList}`),
    addLocationsBtn: () => cy.contains('Add locations'),
    addLocations2Btn: () => cy.get('.side-panel > :nth-child(2) > button'),
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
    nextBtn: () => cy.contains('Next'),
    selectCommodity: () =>
      cy.get('.css-k008qs > .MuiFormControl-root > .MuiInputBase-root > .MuiSelect-select'),
    searchInput: () => cy.get('.input-search__input'),
    downloadCSVOptionBtn: () => cy.contains('CSV'),
    MapOptionBtn: () => cy.contains('span[role="menuitem"]', 'Map'),
    downloadShapefileptionBtn: () => cy.contains('Shapefile'),
    downloadTypeDropdown: () => cy.get('#downloadTypeSelect'),
    downloadTemplateBtn: () => cy.contains('Download'),
    downloadTemplateUploadLocationBtn: () =>
      cy.get('.MuiAccordionSummary-content > .MuiButtonBase-root'),
    locationNameCell: () => cy.get('.rt-td.cell__Location-Name.default-cell'),
    newNameListCell: () => cy.get('#mui-2'),
    newNameListCellPolygon: () => cy.get('#mui-9'),
    newNameListCellPoint: () => cy.get('#mui-8'),
    newNamePolygonListCell: () => cy.get('#mui-1'),
    enterPolygonCoordsBtn: () =>
      cy.get('.css-seoeeh-MuiButtonBase-root-MuiButton-root > .MuiTypography-root'),
    enterPointCoordsBtn: () => cy.get('.css-p6lt5n > :nth-child(1) > .MuiTypography-root'),
    checkbox: () => '.rt-td.td-checkbox',
    downloadListBtn: () => cy.contains('Download…'),
    confirmActionBtn: () => cy.contains('button', 'OK'),
    confirmCoordsBtn: () => cy.get('.css-kj9wkw > .MuiButton-contained'),

    optionListOK: () =>
      cy
        .get('.my-lists-list li')
        .filter(':not(:has(.failed-tooltip.failed-tooltip--default))')
        .first(),
    optionListDraft: () =>
      cy.get('.my-lists-list li').filter(':has(.DiagnosticStatusDraft__label)').first(),
    listByName: (name) => cy.contains(name),
    typeAnalisyscheckBox: (number: number) => cy.get('input[type="checkbox"]').eq(number),
    submitAnalisys: () => cy.contains('Submit Analysis'),
    saveAsDraft: () => cy.contains('Save As Draft'),
    confirmAnalisysBtn: () => cy.get('.MuiDialogActions-root > .MuiButton-contained'),
    pointBtn: () =>
      cy.get(
        '.upload-location-options__main-content__options__other-options > div > :nth-child(1)'
      ),
    polygonBtn: () =>
      cy.get(
        '.upload-location-options__main-content__options__other-options > div > :nth-child(2)'
      ),
    inputCoordLatitude1: () => cy.get('#mui-2'),
    inputCoordLongitude1: () => cy.get('#mui-3'),
    inputCoordLatitude2: () => cy.get('#mui-4'),
    inputCoordLongitude2: () => cy.get('#mui-5'),
    inputCoordLatitude3: () => cy.get('#mui-6'),
    inputCoordLongitude3: () => cy.get('#mui-7'),
    inputCoordLongitude: () => cy.get('#mui-5'),
    inputCoordLatitude: () => cy.get('#mui-6'),
    inputRadiusAroundLoc: () => cy.get('#mui-4'),
    fileAddedSuccess: () => cy.contains('File added successfully'),
    titleFinishLegend: () => cy.get('.MuiTypography-subtitle2'),
    titleListPreview: () => cy.contains('List Preview'),
    locationNameColumn: () => cy.contains('Location Name'),
    analysisRadiusColumn: () => cy.contains('Analysis Radius'),
    analysisAreaColumn: () => cy.contains('Analysis Area'),
    latitudeColumn: () => cy.contains('Latitude'),
    longitudeColumn: () => cy.contains('Longitude'),
    stateColumn: () => cy.contains('State'),
    countryColumn: () => cy.contains('Country'),
    backBtn: () => cy.contains('Back'),
    cancelBtn: () => cy.contains('Cancel'),
    subtitleFinishLegend: () => cy.get('.MuiTypography-caption'),
    returnToLocationBtn: () => cy.get('.MuiPaper-root > .MuiButtonBase-root'),
    checkBoxIconBtn: () => cy.get('[data-testid="CheckBoxOutlineBlankIcon"]').eq(0),
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
  clickOnCheckBoxIcon() {
    this.elements.checkBoxIconBtn().click();
  }

  clickOnNextBtn() {
    this.elements.nextBtn().click();
  }
  selectCommodity(name: string) {
    this.elements.selectCommodity().click().get(`[data-value="${name}"]`).click();
  }
  typeNewNameList(name: string) {
    this.elements.newNameListCell().type(name);
  }
  typeNewNameListPolygon(name: string) {
    this.elements.newNameListCellPolygon().type(name);
  }
  typeNewNameListPoint(name: string) {
    this.elements.newNameListCellPoint().type(name);
  }
  typeNewNameLocation(name: string) {
    this.elements.newNamePolygonListCell().type(name);
  }
  ClickOnEnterPolygonCoordsBtn() {
    this.elements.enterPolygonCoordsBtn().click();
  }
  ClickOnEnterPointCoordsBtn() {
    this.elements.enterPointCoordsBtn().click();
  }
  selectTypeAnalisys(number: number) {
    this.elements.typeAnalisyscheckBox(number).click();
  }
  clickOnSubmitAnalisys() {
    this.elements.submitAnalisys().click();
  }
  clickOnSaveAsDraft() {
    this.elements.saveAsDraft().click();
  }
  clickOnConfirmAnalisysBtn() {
    this.elements.confirmAnalisysBtn().click();
  }
  clickOnPoinBtn() {
    this.elements.pointBtn().click();
  }
  clickOnPolygonBtn() {
    this.elements.polygonBtn().click();
  }
  clickOnPointBtn() {
    this.elements.pointBtn().click();
  }
  clickOnConfirmActionBtn() {
    this.elements.confirmActionBtn().click();
  }
  typeOnInputCoordLat1(latitude: string) {
    this.elements.inputCoordLatitude1().click().type(latitude);
  }
  typeOnInputCoordLong1(longitude: string) {
    this.elements.inputCoordLongitude1().click().type(longitude);
  }
  typeOnInputCoordLat2(latitude: string) {
    this.elements.inputCoordLatitude2().click().type(latitude);
  }
  typeOnInputCoordLong2(longitude: string) {
    this.elements.inputCoordLongitude2().click().type(longitude);
  }
  typeOnInputCoordLat3(latitude: string) {
    this.elements.inputCoordLatitude3().click().type(latitude);
  }
  typeOnInputCoordLong3(longitude: string) {
    this.elements.inputCoordLongitude3().click().type(longitude);
  }
  typeOnInputPointCoordLong(longitude: string) {
    this.elements.inputCoordLongitude().click().type(longitude);
  }
  typeOnInputPointCoordLat(latitude: string) {
    this.elements.inputCoordLatitude().click().type(latitude);
  }
  typeOnInputRadiusAroundLoc(radius: string) {
    this.elements.inputRadiusAroundLoc().click().type(radius);
  }
  clickOnConfirmCoods() {
    this.elements.confirmCoordsBtn().click();
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
  clickOnSingleLocationBtn() {
    this.elements.singleLocationBtn().click();
  }
  clickOnContinueBtn() {
    this.elements.continueBtn().click();
  }
  clickOnComodityBtn() {
    this.elements.comodityBtn().click();
  }
  clickOnCattleGeneriOptionBtn() {
    this.elements.cattleGenericOptionBtn().click();
  }
  clickOnAddListToExistingListBtn() {
    this.elements.addListToExistingBtn().click();
  }
  selectExistingListOption(name) {
    this.elements.selectExistingList(name);
  }
  clickOndrawAShapeOptionBtn() {
    this.elements.drawAShapeBtn().click();
  }
  clickOnAddCoordinatesnBtn() {
    this.elements.addCoordinatesBtn().click();
  }
  addLongitude(longitude) {
    this.elements.longitudeCoordinate().type(longitude);
  }
  addLatitude(latitude) {
    this.elements.latitudeCoordinate().type(latitude);
  }
  selectLocationClassification(option) {
    this.elements.locationClassification().select(option);
  }
  addLocationName(name) {
    this.elements.locationName().type(name);
  }

  clickOnAddLocations2Btn() {
    this.elements.addLocations2Btn().click();
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
