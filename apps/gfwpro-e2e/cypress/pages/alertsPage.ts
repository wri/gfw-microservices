class AlertsPage {
  elements = {
    showListsDropDown: () => cy.contains('Show Lists'),
    reportBtn: () => cy.contains('Report'),
    downloadBtn: () => cy.contains('Download'),
    viewMapBtn: () => cy.contains('View Map'),
    listInfo: () => cy.get('.list-section-info'),
    pageTitle: () => cy.get('.page-title-text'),
    subtitle: () => cy.get('.subtitle'),
    downloadConfirmationTitle: () => cy.get('[data-cy="download-dialog"]'),
    downloadConfirmationMessage: () => cy.get('.dialog__prompt'),
    downloadConfirmationCloseBtn: () =>
      cy.get('[data-cy="download-dialog"]').find('[type="button"]'),
    weekRadioBtn: () => cy.contains('Week'),
    monthRadioBtn: () => cy.contains('Month'),
    quarterRadioBtn: () => cy.contains('Quarter'),
    yearRadioBtn: () => cy.contains('Year'),
  };

  selectListFromDropDown(name: string) {
    this.elements.showListsDropDown().click();
    cy.contains(name).click();
  }

  navigateToListMap() {
    this.elements.viewMapBtn().click();
  }

  downloadAlertsReport() {
    this.elements.downloadBtn().click();
  }
}

export default AlertsPage;
