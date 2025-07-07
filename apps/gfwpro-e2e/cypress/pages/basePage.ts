class BasePage {
  elements = {
    locationsHeaderBtn: () => cy.contains('Locations'),
    mapHeaderBtn: () => cy.contains('Map'),
    alertsHeaderBtn: () => cy.contains('Alerts'),
    loginNav: () => cy.get('[data-cy="desktopHeader"]').find('[data-cy="loginNav"]'),
    usernameInput: () => cy.get('[data-cy="desktopHeader"]').find('[data-cy="username"]'),
    passwordInput: () => cy.get('[data-cy="desktopHeader"]').find('[data-cy="password"]'),
    loginBtn: () => cy.get('[data-cy="desktopHeader"]').find('[data-cy="loginButton"]'),
    tokenInput: () => cy.get('[data-cy="verifyToken"]'),
    verifyBtn: () => cy.get('[data-cy="verifyButton"]')
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

  clickOnLoginNav() {
    this.elements.loginNav().click();
  }

  clickOnLoginBtn() {
    this.elements.loginBtn().click();
  }

  clickOnVerifyBtn() {
    this.elements.verifyBtn().click();
  }

  fillUsername(username) {
    this.elements.usernameInput().type(username);
  }

  fillPassword(password) {
    this.elements.passwordInput().type(password);
  }

  fillToken(token) {
    this.elements.tokenInput().type(token);
  }
}

export default BasePage;
