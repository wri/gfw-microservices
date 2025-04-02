import { CreateLargeListService } from '../../list-upload/create.large.list.service';

type CreateListRequest = {
  listName: string;
  userId: number;
  clientDatabase: string;
  analysisIds: Array<string>;
  templateData: Array<{ template_id: number; commodity: string }>;
  gfwListId: number;
  commodity: string;
  saveAsDraft: boolean;
};

export const handleNewListCreation = async (param: CreateListRequest) => {
  const createLargeListService = new CreateLargeListService();
  const { template_id = 13, commodity = 'Unknown' } = param.templateData?.[0] || {};
  return await createLargeListService.run({
    ...param,
    templateId: template_id,
    commodity: commodity,
  });
};
