import { gfwListsIds } from '@wri-monorepos/constants';
import { GFW_LISTS_NUMBER_CONSTANTS } from './gfwLists.constants';

describe('Compare webserver and libs gfwLists constants', () => {
  it('Compare webserver and libs gfwListsIds', () => {
    expect(GFW_LISTS_NUMBER_CONSTANTS).toEqual(gfwListsIds);
  });
});
