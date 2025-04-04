import { listStatus } from '@wri-monorepos/constants';
import { UspResetListStatus } from '@wri-monorepos/sql';

export const SetListDraftStatus = (clientDatabase, listId, gfwListId) => {
  return new UspResetListStatus().run(clientDatabase, listId, listStatus.Draft, gfwListId);
};
