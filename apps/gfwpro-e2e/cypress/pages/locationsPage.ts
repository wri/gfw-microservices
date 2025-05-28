class LocationsPage {
  elements = {
    singleLocationBtn: () => cy.get('#AddSingleLocation'),
    continueBtn: () => cy.contains('Continue'),
    comodityBtn: () => cy.get('.commodity-option-label'),
    cattleGenericOptionBtn: () =>
      cy.get('.locations-upload-step__suboptions-container > :nth-child(3) > label'),
    existingListDropdown: () =>
      cy.get('.css-1oen9bp > .MuiFormControl-root > .MuiInputBase-root > .MuiSelect-select'),
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
    addLocationsBtn: () => cy.get('[data-cy="nuw_add"]'),
    fileUploadBtn: () => cy.get('.upload-location-options__main-content__options > :nth-child(2)'),
    dataTemplatesBtn: () => cy.get('.MuiPaper-root > :nth-child(5)'),
    shapefileOption: () => cy.get('[role="button"]').contains('Polygon Shapefile'),
    kmlOption: () => cy.get('[role="button"]').contains('KML'),
    spreadSheetOption: () => cy.get('[role="button"]').contains('Spreadsheet'),
    pointShapefileOption: () => cy.get('[role="button"]').contains('Point Shapefile'),
    listOfPalmMillIDsOption: () => cy.get('[role="button"]').contains('List of Palm Mill IDs'),
    checkBtn: () => cy.get('[data-testid="DownloadDoneIcon"]'),
    nextBtn: () => cy.get('[data-testid="ArrowForwardIosIcon"]'),
    selectCommodity: () =>
      cy.get('.css-k008qs > .MuiFormControl-root > .MuiInputBase-root > .MuiSelect-select'),
    searchInput: () => cy.get('.input-search__input'),
    downloadCSVOptionBtn: () => cy.contains('CSV'),
    mapOptionBtn: () => cy.contains('span[role="menuitem"]', 'Map'),
    downloadShapefileptionBtn: () => cy.contains('Shapefile'),
    downloadTypeDropdown: () => cy.get('#downloadTypeSelect'),
    downloadTemplateBtn: () => cy.contains('Download'),
    downloadTemplateUploadLocationBtn: () => cy.get('[data-testid="DownloadIcon"]'),
    locationNameCell: () => cy.get('.rt-td.cell__Location-Name.default-cell'),
    newNameListCell: () => cy.get('[placeholder="Name your new list"]'),
    newListNameInput: () => cy.get('input[placeholder="Name your new list"]'),
    newLocationName: () => cy.get('input[name="locationName"]'),
    enterPolygonCoordsBtn: () =>
      cy.get('.css-seoeeh-MuiButtonBase-root-MuiButton-root > .MuiTypography-root'),
    enterPointCoordsBtn: () => cy.get('.css-p6lt5n > :nth-child(1) > .MuiTypography-root'),
    checkbox: () => '.rt-td.td-checkbox',
    downloadListBtn: () => cy.contains('Download…'),
    confirmActionBtn: () => cy.contains('button', 'OK'),
    confirmCoordenatesBtn: () => cy.get('[data-testid="CheckIcon"]'),
    optionListOK: () =>
      cy
        .get('.my-lists-list li')
        .filter(':not(:has(.failed-tooltip.failed-tooltip--default))')
        .first(),
    optionListDraft: () =>
      cy.get('.my-lists-list li').filter(':has(.DiagnosticStatusDraft__label)').first(),
    listByName: (name) => cy.contains(name),
    typeAnalisyscheckBox: (number: number) => cy.get('input[type="checkbox"]').eq(number),
    submitAnalisys: () => cy.contains('Submit for analysis'),
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
    inputLatitudeCoordinates: () => cy.get('input[name="latitude"]'),
    inputLongitudeCoordinates: () => cy.get('input[name="longitude"]'),
    inputLatitudeCoordinatesPolygon: () => cy.get('[data-testid="latitude-input"]'),
    inputLongitudeCoordinatesPolygon: () => cy.get('[data-testid="longitude-input"]'),
    inputCoordLatitude1: () => cy.get('#mui-2'),
    inputCoordLongitude1: () => cy.get('#mui-3'),
    inputCoordLatitude2: () => cy.get('#mui-4'),
    inputCoordLongitude2: () => cy.get('#mui-5'),
    inputCoordLatitude3: () => cy.get('#mui-6'),
    inputCoordLongitude3: () => cy.get('#mui-7'),
    inputCoordLongitude: () => cy.get('#mui-5'),
    inputCoordLatitude: () => cy.get('#mui-6'),
    inputRadiusAroundLocation: () => cy.get('input[name="areaSize"]'),
    fileAddedSuccess: () => cy.contains('File added successfully'),
    titleFinishLegend: () => cy.get('.MuiTypography-subtitle2'),
    titleListPreview: () => cy.contains('List Preview', { timeout: 5000 }),
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
    post2020Analysis: () => cy.contains('Post-2020 Risk Assessment'),
    defReportAnalysis: () => cy.contains('Recent Deforestation Alerts'),
    post2000Analysis: () => cy.contains('Post-2000 Forest Change'),
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
  inputNewListName(name: string) {
    this.elements.newListNameInput().type(name);
  }
  inputNewLocationName(name: string) {
    this.elements.newLocationName().type(name);
  }
  ClickOnEnterPolygonCoordsBtn() {
    this.elements.enterPolygonCoordsBtn().click();
  }
  ClickOnEnterPointCoordsBtn() {
    this.elements.enterPointCoordsBtn().click();
  }
  selectAnalisysType(analysis: string) {
    switch (analysis) {
      case 'post-2020':
        this.elements.post2020Analysis().click();
        break;
      case 'defReport':
        this.elements.defReportAnalysis().click();
        break;
      case 'post-2000':
        this.elements.post2000Analysis().click();
        break;
      default:
        break;
    }
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
  enterPolygonCoordinates(...coordinates: any[]) {
    coordinates.forEach(([latitude, longitude], index) => {
      this.elements.inputLatitudeCoordinatesPolygon().eq(index).click().type(latitude);
      this.elements.inputLongitudeCoordinatesPolygon().eq(index).click().type(longitude);
    });
  }
  enterPointLongitude(longitude: string) {
    this.elements.inputLongitudeCoordinates().click().type(longitude);
  }
  enterPointLatitude(latitude: string) {
    this.elements.inputLatitudeCoordinates().click().type(latitude);
  }
  enterRadiusAroundLocation(radius: string) {
    this.elements.inputRadiusAroundLocation().click().type(radius);
  }
  clickOnConfirmCoordenates() {
    this.elements.confirmCoordenatesBtn().click();
  }

  clickOnMapBtn() {
    this.elements.mapOptionBtn().click();
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
  selectExistingList(name: string) {
    this.elements.existingListDropdown().click().get(`[data-value="${name}"]`).click();
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

  clickOnfileUploadBtn() {
    this.elements.fileUploadBtn().click();
  }

  clickOndataTemplatesBtn() {
    this.elements.dataTemplatesBtn().click();
  }

  clickOnShapeFileOptionBtn() {
    this.elements.shapefileOption().click();
  }
  clickOnKMLOptionBtn() {
    this.elements.kmlOption().click();
  }
  clickOnSpreadSheetOptionBtn() {
    this.elements.spreadSheetOption().click();
  }
  clickOnPointShapefileOptionBtn() {
    this.elements.pointShapefileOption().click();
  }
  clickOnListOfPalmMillIDsOptionBtn() {
    this.elements.listOfPalmMillIDsOption().click();
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
