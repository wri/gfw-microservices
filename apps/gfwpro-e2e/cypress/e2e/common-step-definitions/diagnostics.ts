import { Given } from '@badeball/cypress-cucumber-preprocessor';

import * as List from '../../app-api/List';

Given("I'm viewing diagnostics for {string}", (listName: string) => {
  cy.loginUI();
  List.withName(listName).viewDiagnostics();
});
