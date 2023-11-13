import { listStatus, listStatusOrderByWorse, listStatusDescriptions } from '@wri-monorepos/constants';
import * as webserverConstants from './listStatuses.constants';

describe('Compare webserver and libs listStatus constants', () => {
  it('Compare webserver and libs listStatus', () => {
    expect(webserverConstants.listStatus).toEqual(listStatus);
  });

  it('Compare webserver and libs listStatusOrderByWorse', () => {
    expect(webserverConstants.listStatusOrderByWorse).toEqual(listStatusOrderByWorse);
  });

  it('Compare webserver and libs listStatusOrderByWorse', () => {
    expect(webserverConstants.listStatusDescriptions).toEqual(listStatusDescriptions);
  });
});
