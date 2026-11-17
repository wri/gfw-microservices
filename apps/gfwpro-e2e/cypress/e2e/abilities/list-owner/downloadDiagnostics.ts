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

// Dismiss the download confirmation dialog if it is open.
// Key off the dialog's own "Got it" button rather than [data-cy="download-dialog"]:
// that data-cy is shared with other dialogs (e.g. AlertsDateSelector), so its presence
// does not prove *this* dialog is open and would make the click below flaky.
// Avoid [data-testid="CloseIcon"] too: MUI stamps that test id on every <Close /> icon,
// and this page also renders one inside the sunset banner, so it is ambiguous.
const closeDownloadDialogIfOpen = () => {
  cy.get('body').then(($body) => {
    if ($body.find('[data-cy="download-dialog-got-it"]:visible').length) {
      cy.get('[data-cy="download-dialog-got-it"]').click();
      cy.get('[data-cy="download-dialog-got-it"]').should('not.exist');
    }
  });
};

// DownloadForOfflineIcon is only rendered by DiagnosticsChartHeader, so scoping to
// .diagnostics-chart-header yields the same set (and therefore the same indices) as the
// previous document-wide query. Assert the count so an index shift fails loudly instead
// of silently clicking the wrong chart.
const clickChartDownloadIcon = (index: number) => {
  cy.get('.diagnostics-chart-header [data-testid="DownloadForOfflineIcon"]')
    .should(($icons) => {
      expect($icons.length, 'chart download icons').to.be.greaterThan(index);
    })
    .eq(index)
    .click();
};

Then('I am able to download percentage tree of forest', () => {
  closeDownloadDialogIfOpen();
  clickChartDownloadIcon(1);
});

Then('I am able to download percentage of historic area lost', () => {
  closeDownloadDialogIfOpen();
  clickChartDownloadIcon(2);
});

Then('I am able to download tree cover loss', () => {
  closeDownloadDialogIfOpen();
  clickChartDownloadIcon(3);
});

Then('I am able to download tree cover loss on argentina otbn', () => {
  closeDownloadDialogIfOpen();
  cy.get('.MuiTabs-root').find('button').last().click();
  cy.get('.diagnostics-chart-header [data-testid="DownloadForOfflineIcon"]').last().click();
});
