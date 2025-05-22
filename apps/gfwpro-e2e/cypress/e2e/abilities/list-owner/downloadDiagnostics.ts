import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import * as ListDiagnostic from '../../../app-api/ListDiagnostic';

When('I try to download the list data for {string}', (list: string) => {
  cy.get('#viewToggle').select('Post-2000 Forest Change');
  ListDiagnostic.downloadListData(list);
});

Then('I can see the download confirmation', () => {
  cy.get('[data-cy="download-dialog"]').should('be.visible');
});

Then('I am able to download the list data', () => {
  cy.get('[data-cy="download-diagnostics"]').should('be.visible');
});

Then('I am able to download percentage tree of forest', () => {
  if (!cy.get('[data-cy="download-dialog"]').should('be.visible')) {
    cy.get('.diagnostics-chart-header').get('[data-testid="DownloadForOfflineIcon"]').eq(1).click();
  } else {
    cy.get('[data-testid="CloseIcon"]').click();
    cy.get('.diagnostics-chart-header').get('[data-testid="DownloadForOfflineIcon"]').eq(1).click();
  }
});

Then('I am able to download percentage of historic area lost', () => {
  if (!cy.get('[data-cy="download-dialog"]').should('be.visible')) {
    cy.get('.diagnostics-chart-header').get('[data-testid="DownloadForOfflineIcon"]').eq(2).click();
  } else {
    cy.get('[data-testid="CloseIcon"]').click();
    cy.get('.diagnostics-chart-header').get('[data-testid="DownloadForOfflineIcon"]').eq(2).click();
  }
});

Then('I am able to download tree cover loss', () => {
  if (!cy.get('[data-cy="download-dialog"]').should('be.visible')) {
    cy.get('.diagnostics-chart-header').get('[data-testid="DownloadForOfflineIcon"]').eq(3).click();
  } else {
    cy.get('[data-testid="CloseIcon"]').click();
    cy.get('.diagnostics-chart-header').get('[data-testid="DownloadForOfflineIcon"]').eq(3).click();
  }
});

Then('I am able to download tree cover loss on argentina otbn', () => {
  if (!cy.get('[data-cy="download-dialog"]').should('be.visible')) {
    cy.get('.MuiTabs-root').find('button').last().click();
    cy.get('.diagnostics-chart-header').get('[data-testid="DownloadForOfflineIcon"]').eq(4).click();
  } else {
    cy.get('[data-testid="CloseIcon"]').click();
    cy.get('.MuiTabs-root').find('button').last().click();
    cy.get('.diagnostics-chart-header')
      .get('[data-testid="DownloadForOfflineIcon"]')
      .last()
      .click();
  }
});
