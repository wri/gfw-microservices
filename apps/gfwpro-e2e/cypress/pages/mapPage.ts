class MapPage {
  elements = {
    languageBtn: () => cy.contains('language'),
    englishBtn: () => cy.contains('English'),
    inputDecimalDegreesFirst: () => cy.get('[class="deg-input"]').first(),
    inputDecimalDegreesLast: () => cy.get('[class="deg-input"]').last(),
    selectNorthSouthOption: () =>
      cy.get('[class="search-tools map-component search-tools-coords"]').find('select').first(),
    selectWestEastOption: () =>
      cy.get('[class="search-tools map-component search-tools-coords"]').find('select').last(),
    searchCoordinatesBtn: () => cy.get('[id="coordinateSearch"]').find('button'),
    searchDecimalDegreesBtn: () => cy.get('[class="search-box degrees "]').find('button'),
    tabCoordinates: () => cy.contains('Coordinates'),
    tabDecimalDegrees: () => cy.contains('Decimal Degrees'),
    closeToSearchLocationBtn: () => cy.get('[class="close-icon pointer search-tool-close-icon"]'),
    optionsLocationsSearch: () => cy.get('[id="search-widget-source-menu-button"]'),
    optionTodoLocationSearch: () => cy.get('[id="search-widget-source-item-0"]').contains('All'),
    zoomInBtn: () => cy.get('[class="control-panel__zoom-in pointer"]'),
    zoomOutBtn: () => cy.get('[class="control-panel__zoom-out pointer"]'),
    searchBtn: () => cy.get('[class="control-panel__locate-me pointer"]'),
    inputSearch: () => cy.get('[title="Find address or place"]'),
    suggestionInputDefault: () =>
      cy.get('[id="search-widget-suggestion-item-0"]').contains('Use current location'),
    clearInputBtn: () => cy.get('[class="esri-search__clear-button esri-widget--button"]'),
    tabModalAnalysis: () => cy.get('[id="analysisHeader"]'),
    tabModalBaseMap: () => cy.get('[id="basemapHeader"]'),
    tabDrawFormInAnalysis: () => cy.get('[id="draw-active-analysis"]'),
    tabCountryOrRegionInAnalysis: () => cy.get('[id="region-active-analysis"]'),
    tabBodyInAnalysis: () => cy.get('[class="analysis__body__instructions"]'),
    startDrawBtn: () => cy.contains('Start Drawing'),
    cancelDrawBtn: () => cy.get('[class="analysis__body__draw__button"]'),
    selectCountryBtn: () => cy.get('[placeholder="Select Country"]'),
    analizeBtn: () =>
      cy.get(
        '[class="gfw-button AnalysisPanel__button btn-green text__semi-bold-12 button-disabled"]'
      ),
    addBtn: () =>
      cy.get(
        '[class="gfw-button AnalysisPanel__button btn-green text__semi-bold-12 button-disabled"]'
      ),
    optionDefaultBaseMapBtn: () => cy.get('[id="custom-default"]'),
    optionTerrainBaseMapBtn: () => cy.get('[id="custom-terrain"]'),
    optionSatelliteBaseMapBtn: () => cy.get('[id="satellite"]'),
    optionLandsatBaseMapBtn: () => cy.get('[id="landsat"]'),
    optionOpenStreeBaseMapBtn: () => cy.get('[id="osm"]'),
    optionDarkMatterBaseMapBtn: () => cy.get('[id="dark-matter"]'),
    optionPositronBaseMapBtn: () => cy.get('[id="positron"]'),
    optionHybridBaseMapBtn: () => cy.get('[id="hybrid"]'),
    optionTreeHeightBaseMapBtn: () => cy.get('[id="tree-height"]'),
    optionPlanetBaseMapBtn: () => cy.get('[id="planet-basemap"]'),
    infoDefaultBaseMapBtn: () =>
      cy.get(
        '[class="info-icon metadata analysis-panel-metadata pointer custom-default-basemap-metadata"]'
      ),
    infoTerrainBaseMapBtn: () =>
      cy.get(
        '[class="info-icon metadata analysis-panel-metadata pointer custom-terrain-basemap-metadata"]'
      ),
    infoSatelliteBaseMapBtn: () =>
      cy.get(
        'class="info-icon metadata analysis-panel-metadata pointer satellite-basemap-metadata"'
      ),
    eyeTreeCoverLossBtn: () => cy.get('[id="Tree cover loss-layer-checkbox"]').find('span').first(),
    eyeTreeCoverGainBtn: () => cy.get('[id="Tree cover gain-layer-checkbox"]').find('span').first(),
    eyeTreeCoverBtn: () => cy.get('[id="Tree cover 2000-layer-checkbox"]').find('span').first(),
  };
  clickOnLanguage() {
    this.elements.languageBtn().click();
  }
  selectEnglishLenguage() {
    this.elements.englishBtn().click();
  }

  clickOnZoomIn() {
    this.elements.zoomInBtn().click();
  }
  clickOnZoomOut() {
    this.elements.zoomOutBtn().click();
  }

  clickOnSearch() {
    this.elements.searchBtn().click();
  }
  clickOnInputSearch() {
    this.elements.inputSearch().click();
  }
  clickOnOptionLocationSearchBtn() {
    this.elements.optionsLocationsSearch().click();
  }
  clickOnOptionTodoLocationSearch() {
    this.elements.optionTodoLocationSearch().click();
  }
  clickToCloseSearchLocation() {
    this.elements.closeToSearchLocationBtn().click();
  }
  clickOnTabCoordinates() {
    this.elements.tabCoordinates().click();
  }
  clickOnTabDecimalDegrees() {
    this.elements.tabDecimalDegrees().click();
  }
  clickOnSearchCoordinates() {
    this.elements.searchCoordinatesBtn().click();
  }
  clickOnSearchDecimalDegrees() {
    this.elements.searchDecimalDegreesBtn().click();
  }
  clickOnTabModalAnalysis() {
    this.elements.tabModalAnalysis().click();
  }
  clickTabCountryOrRegion() {
    this.elements.tabCountryOrRegionInAnalysis().click();
  }
  clickOnTabModalBaseMap() {
    this.elements.tabModalBaseMap().click();
  }

  clickOnStartDraw() {
    this.elements.startDrawBtn().click();
  }
  clickOnCancelBtn() {
    this.elements.cancelDrawBtn().click();
  }
  clickOnSelectCountry() {
    this.elements.selectCountryBtn().click();
  }

  clickOnOptionDefaultBaseMap() {
    this.elements.optionDefaultBaseMapBtn().click();
  }

  clickOnOptionTerrainBaseMap() {
    this.elements.optionTerrainBaseMapBtn().click();
  }
  clickOnOptionSatelliteBaseMap() {
    this.elements.optionSatelliteBaseMapBtn().click();
  }
  clickOnOptionoptionLandsatBaseMap() {
    this.elements.optionLandsatBaseMapBtn().click();
  }
  clickOnOptionOpenStreetBaseMap() {
    this.elements.optionOpenStreeBaseMapBtn().click();
  }
  clickOnOptionDarkMatterBaseMap() {
    this.elements.optionDarkMatterBaseMapBtn().click();
  }
  clickOnOptionPositronBaseMap() {
    this.elements.optionPositronBaseMapBtn().click();
  }
  clickOnOptionHybridBaseMap() {
    this.elements.optionHybridBaseMapBtn().click();
  }
  clickOnOptionTreeHeightBaseMap() {
    this.elements.optionTreeHeightBaseMapBtn().click();
  }
  clickOnOptionPlanetBaseMap() {
    this.elements.optionPlanetBaseMapBtn().click();
  }

  clickOnInfoDefaultBaseMap() {
    this.elements.infoDefaultBaseMapBtn().click();
  }

  clickOnInfoTerrainBaseMap() {
    this.elements.infoTerrainBaseMapBtn().click();
  }
  clickOnInfoSatelliteBaseMap() {
    this.elements.infoSatelliteBaseMapBtn().click();
  }

  clickOnEyeTreeCoverLoss() {
    this.elements.eyeTreeCoverLossBtn().click();
  }
  clickOnEyeTreeCoverGain() {
    this.elements.eyeTreeCoverGainBtn().click();
  }
  clickOnEyeTreeCover() {
    this.elements.eyeTreeCoverBtn().click();
  }
  // verifyTreeCoverLossInMap() {
  //   let canvasScreenshot;

  //   cy.get('canvas')
  //     .should('be.visible')
  //     .then(($canvas) => {
  //       cy.wrap($canvas)
  //         .screenshot({
  //           capture: 'runner',
  //           clip: {
  //             x: $canvas[0].getBoundingClientRect().left,
  //             y: $canvas[0].getBoundingClientRect().top,
  //             width: $canvas[0].width,
  //             height: $canvas[0].height,
  //           },
  //         })
  //         .then((dataUrl) => {
  //           canvasScreenshot = dataUrl;
  //         });
  //     });

  //   cy.wrap(null).should(() => {
  //     const img = new Image();
  //     img.src = canvasScreenshot;
  //     img.onload = () => {
  //       const canvas = document.createElement('canvas');
  //       canvas.width = img.width;
  //       canvas.height = img.height;
  //       const ctx = canvas.getContext('2d');
  //       ctx.drawImage(img, 0, 0);

  //       const imageData = ctx.getImageData(0, 0, img.width, img.height).data;

  //       const expectedColor = { r: 220, g: 108, b: 154, a: 255 };
  //       let colorFound = false;
  //       for (let i = 0; i < imageData.length; i += 4) {
  //         const r = imageData[i];
  //         const g = imageData[i + 1];
  //         const b = imageData[i + 2];
  //         const a = imageData[i + 3];

  //         if (
  //           r === expectedColor.r &&
  //           g === expectedColor.g &&
  //           b === expectedColor.b &&
  //           a === expectedColor.a
  //         ) {
  //           colorFound = true;
  //           break;
  //         }
  //       }

  //       expect(colorFound).to.be.true;
  //     };
  //   });
  // }

  wait(number: number) {
    cy.wait(number);
  }
}

export default MapPage;
