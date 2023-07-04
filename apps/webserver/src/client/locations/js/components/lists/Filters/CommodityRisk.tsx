import React from 'react';
import GFWCommodityRiskFilter from '../GFWCommodityRiskFilter';
import CommodityRiskFilter from '../CommodityRiskFilter';
import { GFWLists } from '../../../config/listNames';

interface CommodityRiskFilterProps {
  listName: string;
  listData: [];
  filterCount: number;
  listView: string;
  clearFilters: () => void;
}

export const CommodityRiskFilterDrawer = ({
  listName,
  listData,
  filterCount,
  listView,
  clearFilters,
}: CommodityRiskFilterProps) => {
  return listName === GFWLists[2] ? (
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
