import { CreateLargeListService } from '../../list-upload/create.large.list.service';

type CreateListRequest = {
  listName: string;
  userId: number;
  clientDatabase: string;
  analysisIds: Array<string>;
  gfwListId: number;
  commodity: string;
  saveAsDraft: boolean;
};

export const handleNewListCreation = async (param: CreateListRequest) => {
  const createLargeListService = new CreateLargeListService();
  return await createLargeListService.run({
    ...param,
  });
};
