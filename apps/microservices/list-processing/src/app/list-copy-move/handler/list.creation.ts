import { ConvertCommodityToMapSpamCode } from '../../list-upload/chain/convert.commodity.mapspam';
import { CreateLargeListService } from '../../list-upload/create.large.list.service';
import { CommodityService } from '../../list/commodity.service';

type CreateListRequest = {
  listName: string;
  userId: number;
  clientDatabase: string;
  analysisIds: Array<string>;
  gfwListId: number;
  selectedListId: number;
  commodity: string;
  saveAsDraft: boolean;
  commodityService: CommodityService;
};

export const handleNewListCreation = async (param: CreateListRequest) => {
  const { commodityService } = param;

  const { commodity } = await commodityService.getCommodityFromExistingList(
    param.clientDatabase,
    param.selectedListId
  );

  const commodityHumanReadable = ConvertCommodityToMapSpamCode.getCommoditySpamName(commodity);

  const createLargeListService = new CreateLargeListService();
  return await createLargeListService.run({
    ...param,
    commodity: commodityHumanReadable,
  });
};
