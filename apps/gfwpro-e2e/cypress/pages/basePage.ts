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
    verifyBtn: () => cy.get('[data-cy="verifyButton"]'),
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
    this.elements.loginNav().should('be.visible').click();
    this.elements.usernameInput().should('be.visible');
    this.elements.passwordInput().should('be.visible');
  }

  clickOnLoginBtn() {
    this.elements.loginBtn().should('be.enabled').click();
  }

  clickOnVerifyBtn() {
    this.elements.verifyBtn().click();
  }

  fillUsername(username) {
    this.elements.usernameInput().clear().type(username).should('have.value', username);
  }

  fillPassword(password) {
    this.elements.passwordInput().clear().type(password).should('have.value', password);
  }

  fillToken(token) {
    this.elements.tokenInput().should('be.visible').clear().type(token).should('have.value', token);
  }
}

export default BasePage;
