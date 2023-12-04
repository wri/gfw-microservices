import React from 'react';
import GFWCommodityRiskFilter from '../GFWCommodityRiskFilter';
import CommodityRiskFilter from '../CommodityRiskFilter';
import { GFWLists } from '../../../../../locations/js/config/listNames';

interface CommodityRiskFilterProps {
  listName: string;
  listData: [];
  filterCount: number;
  listView: string;
  clearFilters: () => void;
}

const PALM_OIL_INDEX = 2;

export const CommodityRiskFilterDrawer = ({
  listName,
  listData,
  filterCount,
  listView,
  clearFilters,
}: CommodityRiskFilterProps) => {
  return listName === GFWLists[PALM_OIL_INDEX] ? (
    <GFWCommodityRiskFilter
      listData={listData}
      filterCount={filterCount}
      listView={listView}
      clearFilters={clearFilters}
    />
  ) : (
    <CommodityRiskFilter
      listData={listData}
      filterCount={filterCount}
      listView={listView}
      clearFilters={clearFilters}
    />
  );
};
