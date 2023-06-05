import React from 'react';
import GFWCommodityRiskFilter from '../GFWCommodityRiskFilter';
import CommodityRiskFilter from '../CommodityRiskFilter';

interface CommodityRiskFilterProps {
  listName: string;
  listData: [];
  filterCount: number;
  listView: string;
}

export const CommodityRiskFilterDrawer = ({
  listName,
  listData,
  filterCount,
  listView,
}: CommodityRiskFilterProps) => {
  return listName === 'Palm Oil Mills' ? (
    <GFWCommodityRiskFilter listData={listData} filterCount={filterCount} listView={listView} />
  ) : (
    <CommodityRiskFilter listData={listData} filterCount={filterCount} listView={listView} />
  );
};
