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

// Dismiss the confirmation dialog using its own "Got it" button.
// Avoid [data-testid="CloseIcon"]: MUI stamps that test id on every <Close /> icon,
// and this page also renders one inside the sunset banner, so the selector is ambiguous.
const closeDownloadDialogIfOpen = () => {
  cy.get('body').then(($body) => {
    if ($body.find('[data-cy="download-dialog"]').length) {
      cy.get('[data-cy="download-dialog-got-it"]').click();
      cy.get('[data-cy="download-dialog"]').should('not.exist');
    }
  });
};

// Scope the icon to the chart header so the index is stable.
const clickChartDownloadIcon = (index: number) => {
  cy.get('.diagnostics-chart-header [data-testid="DownloadForOfflineIcon"]').eq(index).click();
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
