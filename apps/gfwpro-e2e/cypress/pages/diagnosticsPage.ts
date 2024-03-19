class DiagnosticsPage {
  elements = {
    forestChangeTab: () => cy.contains('Forest change'),
    commodityRiskTab: () => cy.contains('Commodity risk'),
    reportBtn: () => cy.contains('Report'),
    downloadBtn: () => cy.get('[data-cy="download-diagnostics"]'),
    diagnosticsMap: () => cy.get('#locations-diagnostics-header-map'),
  };
}

export default DiagnosticsPage;
