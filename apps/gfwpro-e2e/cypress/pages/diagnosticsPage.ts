class DiagnosticsPage {
  elements = {
    forestChangeTab: () => cy.contains('Forest change'),
    commodityRiskTab: () => cy.contains('Commodity risk'),
    reportBtn: () => cy.contains('Report'),
    downloadBtn: () => cy.get('[data-cy="download-diagnostics"]'),
    diagnosticsMap: () => cy.get('#locations-diagnostics-header-map'),
    headerLocationCount: () => cy.get('.diagnostics-header-info__location-count'),
    headerInfo: () => cy.get('div.diagnostics-header-info > div:nth-child(1)'),
    historicSiteCharacteristicsInfoBubble: () => cy.get('#historic_site_characteristics'),
    listAttributesInfoBubble: () => cy.get('#fc_list_attributes'),
    lossOfForestsInfoBubble: () => cy.get('#sensitive_areas_loss_annual'),
    lossAllYearsInfoBubble: () => cy.get('#loss_all_years'),
    historicAreaLossInfoBubble: () => cy.get('#sensitive_areas_historic_loss'),
    tclInfoBubble: () => cy.get('#regions_sa_annual'),
    brazilBiomesPercentOverlapInfoBubble: () => cy.get('#regions_sa_biomes_calc'),
    tclArgentinaOTBNInfoBubble: () => cy.get('#tree_cover_loss_arg_otbn_yearly'),
    infoBubbleContainer: () => cy.get('.info-bubble-content'),
    diagnosticsRegions: () => cy.get('[data-cy="diagnotcs-regions"]'),
    closeButton: () => cy.get('.info-bubble-content__icon'),
    infoBubbleTitle: () => cy.get('.bubble-title'),
  };

  openInfoBubble(locator) {
    locator().click();
  }

  closeInfoBubble() {
    this.elements.closeButton().click();
  }

  navigateToArgentinaRegionTab() {
    this.elements
      .diagnosticsRegions()
      .contains(/^Argentina$/)
      .click();
  }

  verifyHistoricSiteCharacteristicsInfoBubble() {
    this.elements.infoBubbleTitle().should('have.text', 'Historic Site Characteristics');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'tree cover extent')
      .should('have.attr', 'href')
      .and('include', '/documents/tree-cover-2000/explore');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'primary forest')
      .should('have.attr', 'href')
      .and('include', '/datasets');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'protected areas')
      .should('have.attr', 'href')
      .and('include', '/datasets/protected-areas');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'peat')
      .should('have.attr', 'href')
      .and('include', '/datasets/global-peatlands');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'intact forest landscapes')
      .should('have.attr', 'href')
      .and('include', '/documents/gfw::intact-forest-landscapes/about');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'see this guide.')
      .should('have.attr', 'href')
      .and('include', '/documents/GIS_Data_Formats.pdf');
  }

  verifyListAttributesInfoBubble() {
    this.elements.infoBubbleTitle().should('have.text', 'List Attributes');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'see this guide.')
      .should('have.attr', 'href')
      .and('include', '/documents/GIS_Data_Formats.pdf');
  }

  verifyLossOfForestsInfoBubble() {
    this.elements.infoBubbleTitle().should('have.text', 'Loss of Forests');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'tree cover loss')
      .should('have.attr', 'href')
      .and('include', '/maps/gfw::tree-cover-loss-1/about');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'Primary forest')
      .should('have.attr', 'href')
      .and('include', '/datasets');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'Protected areas')
      .should('have.attr', 'href')
      .and('include', '/datasets/protected-areas');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'Peat')
      .should('have.attr', 'href')
      .and('include', '/datasets/global-peatlands');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'Intact forest landscapes')
      .should('have.attr', 'href')
      .and('include', '/documents/gfw::intact-forest-landscapes/about');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'tree cover extent')
      .should('have.attr', 'href')
      .and('include', '/documents/tree-cover-2000/explore');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'see this guide.')
      .should('have.attr', 'href')
      .and('include', '/documents/GIS_Data_Formats.pdf');
  }

  verifyLossAllYearsInfoBubble() {
    this.elements.infoBubbleTitle().should('have.text', 'Loss (all years)');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'tree cover loss')
      .should('have.attr', 'href')
      .and('include', '/items');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'primary forest')
      .should('have.attr', 'href')
      .and('include', '/datasets');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'Protected areas')
      .should('have.attr', 'href')
      .and('include', '/datasets/protected-areas');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'peat')
      .should('have.attr', 'href')
      .and('include', '/datasets/global-peatlands');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'Intact Forest Landscapes')
      .should('have.attr', 'href')
      .and('include', '/documents/gfw::intact-forest-landscapes/about');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'tree cover extent')
      .should('have.attr', 'href')
      .and('include', '/documents/tree-cover-2000/explore');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'see this guide.')
      .should('have.attr', 'href')
      .and('include', '/documents/GIS_Data_Formats.pdf');
  }

  verifyHistoricAreaLossInfoBubble() {
    this.elements.infoBubbleTitle().should('have.text', 'Percentage of Historic Area Lost');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'tree cover loss')
      .should('have.attr', 'href')
      .and('include', '/items');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'Primary forest')
      .should('have.attr', 'href')
      .and('include', '/datasets');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'Protected areas')
      .should('have.attr', 'href')
      .and('include', '/datasets/protected-areas');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'Peat')
      .should('have.attr', 'href')
      .and('include', '/datasets/global-peatlands');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'Intact forest landscapes')
      .should('have.attr', 'href')
      .and('include', '/documents/gfw::intact-forest-landscapes/about');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'tree cover extent')
      .should('have.attr', 'href')
      .and('include', '/documents/tree-cover-2000/explore');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'see this guide.')
      .should('have.attr', 'href')
      .and('include', '/documents/GIS_Data_Formats.pdf');
  }

  verifyTclInfoBubble() {
    this.elements.infoBubbleTitle().should('have.text', 'Annual Tree Cover Loss in South America');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'tree cover loss')
      .should('have.attr', 'href')
      .and('include', '/items');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'tree cover extent')
      .should('have.attr', 'href')
      .and('include', '/documents/tree-cover-2000/explore');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'see this guide.')
      .should('have.attr', 'href')
      .and('include', '/documents/GIS_Data_Formats.pdf');
  }

  verifyBrazilBiomesPercentOverlapInfoBubble() {
    this.elements.infoBubbleTitle().should('have.text', 'Brazil Biomes');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'Brazil biomes')
      .should('have.attr', 'href')
      .and('include', '/datasets/brazil-biomes');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'see this guide.')
      .should('have.attr', 'href')
      .and('include', '/documents/GIS_Data_Formats.pdf');
  }

  verifyTclArgentinaOTBNInfoBubble() {
    this.elements.infoBubbleTitle().should('have.text', 'Territorial Planning of Native Forests');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'http://snmb.ambiente.gob.ar/develop/')
      .should('have.attr', 'href')
      .and('include', 'http://snmb.ambiente.gob.ar/develop/');
    this.elements
      .infoBubbleContainer()
      .contains('a', 'see this guide.')
      .should('have.attr', 'href')
      .and('include', '/documents/GIS_Data_Formats.pdf');
  }
}

export default DiagnosticsPage;
