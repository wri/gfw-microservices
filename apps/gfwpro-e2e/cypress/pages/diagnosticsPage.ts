class DiagnosticsPage {
  elements = {
    forestChangeTab: () => cy.contains('Forest change'),
    commodityRiskTab: () => cy.contains('Commodity risk'),
    reportBtn: () => cy.contains('Report'),
    downloadBtn: () => cy.get('[data-cy="download-diagnostics"]'),
    diagnosticsMap: () => cy.get('#locations-diagnostics-header-map'),
    headerLocationCount: (name) => cy.contains(name),
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
    selectDiagnostic: (name) => cy.get('#viewToggle').select(name),
    palmRiskAssessmentTab: () => cy.contains('Palm Risk Assessment'),
    chartTitle: () => cy.get('[data-testid="chart-header-title"]'),
  };

  changeDiagnostics(name) {
    this.elements.selectDiagnostic(name);
  }

  clickOnDiagnosticMap() {
    this.elements.diagnosticsMap().click();
  }

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

  navigateToColombiaRegionTab() {
    this.elements
      .diagnosticsRegions()
      .contains(/^Colombia$/)
      .click();
  }

  clickOnPalmRiskAssessmentTab() {
    this.elements.palmRiskAssessmentTab().click();
  }

  verifyPrincipalCharts() {
    cy.get('.locations-diagnostics__subtitle').should('be.visible');
    cy.get(':nth-child(2) > [data-testid="chart-header-title"]').should('be.visible');
    cy.get(':nth-child(3) > .MuiCardContent-root').should('be.visible');
    cy.get('.subsection-chart > .locations-instructional__text').should('be.visible');
    cy.get('.loss-label > span').should('be.visible');
    cy.get('.percent-loss__label').should('be.visible');
    cy.get('[data-cy="tree-cover-loss"]').should('be.visible');
    cy.get('[data-cy="primary-forest"]').should('be.visible');
    cy.get(':nth-child(1) > [data-cy="protected-areas"]').should('be.visible');
    cy.get('[data-cy="peat"]').should('be.visible');
    cy.get('[data-cy="intact-forest-landscape"]').should('be.visible');
    cy.get(
      '.locations-diagnostics-section > :nth-child(4) > [data-testid="chart-header-title"]'
    ).should('be.visible');
    cy.get('.locations-diagnostics-section > :nth-child(5) > .MuiCardContent-root').should(
      'be.visible'
    );
    cy.get('.historic-area__title-container > .locations-instructional__text').should('be.visible');
    cy.get('.table__historic-area > table > tbody > :nth-child(1) > :nth-child(1)').should(
      'be.visible'
    );
    cy.get('.table__historic-area > table > tbody > :nth-child(2) > :nth-child(1)').should(
      'be.visible'
    );
    cy.get('.table__historic-area > table > tbody > :nth-child(3) > :nth-child(1)').should(
      'be.visible'
    );
    cy.get('.table__historic-area > table > tbody > :nth-child(4) > :nth-child(1)').should(
      'be.visible'
    );
    cy.get('.table__historic-area > table > tbody > :nth-child(5) > :nth-child(1)').should(
      'be.visible'
    );
    cy.get('.js-irs-0 > .irs').should('be.visible');
    cy.get('.locations-diagnostics-section-title').should('be.visible');
    cy.get(':nth-child(4) > :nth-child(1) > [data-testid="chart-header-title"]').should(
      'be.visible'
    );
    cy.get(':nth-child(4) > .MuiPaper-root > .MuiCardContent-root').should('be.visible');
    cy.get('[data-cy="soy-cover-loss"] > .legend-square-label').should('be.visible');
    cy.get('[data-cy="prodes"] > .legend-square-label').should('be.visible');
    cy.get(
      '.section__south-america > .locations-diagnostics-table > table > tbody > :nth-child(3) > .locations-diagnostics-table__column'
    ).should('be.visible');
    cy.get(
      '.section__south-america > .locations-diagnostics-table > table > tbody > :nth-child(4) > .locations-diagnostics-table__column'
    ).should('be.visible');
    cy.get(
      '.section__south-america > .locations-diagnostics-table > table > tbody > :nth-child(5) > .locations-diagnostics-table__column'
    ).should('be.visible');
    // cy.get(':nth-child(6) > [data-cy="protected-areas"]').should('be.visible')
    // cy.get(':nth-child(8) > [data-cy="tree-cover-loss"]').should('be.visible')
    cy.get('[data-cy="brazil-biomes"]').should('be.visible');
    cy.get('.js-irs-1 > .irs').should('be.visible');
  }

  verifyChartArgentina() {
    this.verifyPrincipalCharts();

    this.navigateToArgentinaRegionTab();

    cy.contains('ARGENTINIAN DEFORESTATION');
    cy.get('[style="margin-top: 30px;"] > :nth-child(5) > .MuiCardContent-root').should(
      'be.visible'
    );
    cy.get('[data-cy="argentina-tree-cover-loss"] > .legend-square-label').should('be.visible');
    cy.get(':nth-child(2) > .chart-legends-table__label > label').should('be.visible');
    cy.get(':nth-child(3) > .chart-legends-table__label > label').should('be.visible');
    cy.get('[data-cy="argentina-protected-areas"] > .legend-square-label').should('be.visible');
    cy.get('[data-cy="argentina-indigenous-territories"] > .legend-square-label').should(
      'be.visible'
    );
    cy.get('[data-cy="annual-loss-OTBN"]').should('be.visible');
    cy.get('[style="display: flex; align-items: center;"]').should('be.visible');
    cy.get(':nth-child(7) > [data-testid="chart-header-title"]').should('be.visible');
    cy.get(':nth-child(8) > .MuiCardContent-root').should('be.visible');
    cy.get(
      ':nth-child(8) > .MuiCardContent-root > [data-testid="pie-chart"] > .chart-legends-table > table > tbody > :nth-child(1) > :nth-child(1)'
    ).should('be.visible');
    cy.get(
      ':nth-child(8) > .MuiCardContent-root > [data-testid="pie-chart"] > .chart-legends-table > table > tbody > :nth-child(2) > :nth-child(1)'
    ).should('be.visible');
    cy.get(
      ':nth-child(8) > .MuiCardContent-root > [data-testid="pie-chart"] > .chart-legends-table > table > tbody > :nth-child(3) > :nth-child(1)'
    ).should('be.visible');
    cy.get(
      '[data-testid="pie-chart"] > .chart-legends-table > table > tbody > :nth-child(4) > :nth-child(1)'
    ).should('be.visible');
    cy.get(':nth-child(9) > [data-testid="chart-header-title"]').should('be.visible');
    cy.get(':nth-child(10) > .MuiCardContent-root').should('be.visible');
    cy.get(
      ':nth-child(10) > .MuiCardContent-root > [data-testid="pie-chart"] > .chart-legends-table > table > tbody > :nth-child(1) > :nth-child(1)'
    ).should('be.visible');
    cy.get(
      ':nth-child(10) > .MuiCardContent-root > [data-testid="pie-chart"] > .chart-legends-table > table > tbody > :nth-child(2) > :nth-child(1)'
    ).should('be.visible');
    cy.get(
      ':nth-child(10) > .MuiCardContent-root > [data-testid="pie-chart"] > .chart-legends-table > table > tbody > :nth-child(3) > :nth-child(1)'
    ).should('be.visible');
    cy.get(':nth-child(11) > [data-testid="chart-header-title"]').should('be.visible');
    cy.get(':nth-child(12) > .MuiCardContent-root').should('be.visible');
    cy.get(
      ':nth-child(12) > .MuiCardContent-root > [data-testid="pie-chart"] > .chart-legends-table > table > tbody > :nth-child(1) > :nth-child(1) > label'
    ).should('be.visible');
    cy.get(
      ':nth-child(12) > .MuiCardContent-root > [data-testid="pie-chart"] > .chart-legends-table > table > tbody > :nth-child(2) > :nth-child(1) > label'
    ).should('be.visible');
  }
  verifyChartColombia() {
    this.verifyPrincipalCharts();

    this.navigateToColombiaRegionTab();

    cy.contains('COLOMBIAN DEFORESTATION').should('be.visible');
    cy.get('[style="margin-top: 30px;"] > :nth-child(5) > .MuiCardContent-root').should(
      'be.visible'
    );
    cy.get('[data-cy="colombian-tree-cover-loss"] > .legend-square-label').should('be.visible');
    cy.get(
      ':nth-child(5) > .MuiCardContent-root > .diagnostics-chart-container > .chart-legends-table > table > tbody > :nth-child(2) > :nth-child(1)'
    ).should('be.visible');
    cy.get(
      ':nth-child(5) > .MuiCardContent-root > .diagnostics-chart-container > .chart-legends-table > table > tbody > :nth-child(4) > :nth-child(1)'
    ).should('be.visible');
    cy.get(
      ':nth-child(5) > .MuiCardContent-root > .diagnostics-chart-container > .chart-legends-table > table > tbody > :nth-child(12) > :nth-child(1)'
    ).should('be.visible');
    cy.get('[data-cy="protected-areas"] > .legend-square-label').should('be.visible');
    cy.get('[data-cy="indigenous-territories"] > .legend-square-label').should('be.visible');
    cy.get(':nth-child(6) > [data-testid="chart-header-title"]').should('be.visible');
    cy.get(':nth-child(7) > .MuiCardContent-root').should('be.visible');
    cy.get(
      ':nth-child(7) > .MuiCardContent-root > [data-testid="pie-chart"] > .chart-legends-table > table > tbody > :nth-child(1) > :nth-child(1)'
    ).should('be.visible');
    cy.get(
      ':nth-child(7) > .MuiCardContent-root > [data-testid="pie-chart"] > .chart-legends-table > table > tbody > :nth-child(3) > :nth-child(1)'
    ).should('be.visible');
    cy.get(
      '[data-testid="pie-chart"] > .chart-legends-table > table > tbody > :nth-child(11) > :nth-child(1)'
    ).should('be.visible');

    cy.get(':nth-child(8) > [data-testid="chart-header-title"]').should('be.visible');
    cy.get(':nth-child(9) > .MuiCardContent-root').should('be.visible');
    cy.get(
      ':nth-child(9) > .MuiCardContent-root > [data-testid="pie-chart"] > .chart-legends-table > table > tbody > :nth-child(1) > :nth-child(1)'
    ).should('be.visible');
    cy.get(
      ':nth-child(9) > .MuiCardContent-root > [data-testid="pie-chart"] > .chart-legends-table > table > tbody > :nth-child(2) > :nth-child(1)'
    ).should('be.visible');
    cy.get(
      ':nth-child(9) > .MuiCardContent-root > [data-testid="pie-chart"] > .chart-legends-table > table > tbody > :nth-child(3) > :nth-child(1)'
    ).should('be.visible');
    cy.get(':nth-child(10) > [data-testid="chart-header-title"]').should('be.visible');
    cy.get(':nth-child(11) > .MuiCardContent-root').should('be.visible');
    cy.get(
      ':nth-child(11) > .MuiCardContent-root > [data-testid="pie-chart"] > .chart-legends-table > table > tbody > :nth-child(1) > :nth-child(1)'
    ).should('be.visible');
    cy.get(
      ':nth-child(11) > .MuiCardContent-root > [data-testid="pie-chart"] > .chart-legends-table > table > tbody > :nth-child(2) > :nth-child(1)'
    ).should('be.visible');
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
    this.elements.infoBubbleTitle().should('have.text', 'Deforestation in Argentina');
  }

  verifyChartVisibility(title) {
    this.elements.chartTitle().contains(title).should('exist');
  }
}

export default DiagnosticsPage;
