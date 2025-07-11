import { ConvertCommodityToMapSpamCode } from '../../list-upload/chain/convert.commodity.mapspam';
import { CreateLargeListService } from '../../list-upload/create.large.list.service';
import { CommodityService } from '../../commodity/commodity.service';

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
  const { commodityService, gfwListId, commodity: commoditySource } = param;

  let commodity = commoditySource;
  if (!gfwListId) {
    const { commodity: commodityFromExistingList } =
      await commodityService.getCommodityFromExistingList(
        param.clientDatabase,
        param.selectedListId
      );
    commodity = commodityFromExistingList;
  }

  const commodityName =
    ConvertCommodityToMapSpamCode.getCommoditySpamName(commodity) || commodity.replace(/\s+/g, '_');

  const createLargeListService = new CreateLargeListService();
  return await createLargeListService.run({
    ...param,
    commodity: commodityName,
  });
};
