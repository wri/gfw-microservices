class BasePage {
  elements = {
    locationsHeaderBtn: () => cy.contains('Locations'),
    mapHeaderBtn: () => cy.contains('Map'),
    alertsHeaderBtn: () => cy.contains('Alerts'),
  };

  navigateToLocationsPage() {
    this.elements.locationsHeaderBtn().click();
  }

  navigateToMapPage() {
    this.elements.mapHeaderBtn().click();
  }

  navigateToAlertsPage() {
    this.elements.alertsHeaderBtn().click();
  }
}

export default BasePage;
