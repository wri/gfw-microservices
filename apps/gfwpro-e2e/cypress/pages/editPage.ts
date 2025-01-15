class EditPage {
  elements = {
    cancelBtn: () => cy.contains('button', 'Cancel'),
    updateBtn: () => cy.contains('button', 'Update'),
    confirmBtn: () => cy.contains('OK'),
  };

  editCell(input: string) {
    cy.get('select').first().select('Volume');
    cy.get('.locations-grid-cell.locations-grid-cell--editable.valid-td')
      .find('input')
      .first()
      .click();
    cy.get('.locations-grid-cell.locations-grid-cell--editable.valid-td')
      .find('input')
      .first()
      .type(input);
  }
  clickOnCancelBtn() {
    this.elements.cancelBtn().click();
  }
  clickOnUpdateBtn() {
    this.elements.updateBtn().click();
  }
  clickOnConfirmBtn() {
    this.elements.confirmBtn().click();
  }
}

export default EditPage;
