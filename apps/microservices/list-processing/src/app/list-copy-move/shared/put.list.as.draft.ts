import { ListStatus, UspResetListStatus } from '@wri-monorepos/sql';

export const SetListDraftStatus = (clientDatabase, listId, gfwListId) => {
  return new UspResetListStatus().run(clientDatabase, listId, ListStatus.Draft, gfwListId);
};
