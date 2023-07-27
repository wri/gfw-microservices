import { Given } from '@badeball/cypress-cucumber-preprocessor';
import * as User from '../../app-api/User';
import * as List from '../../app-api/List';

Given("I'm viewing diagnostics for {string}", (listName: string) => {
  User.login();
  List.withName(listName).viewDiagnostics();
});