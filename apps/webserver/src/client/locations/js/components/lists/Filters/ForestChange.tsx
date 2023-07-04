import React from 'react';
import GFWForestChangeFilter from '../GFWForestChangeFilter';
import GFWAdminForestChangeFilter from '../GFWAdminForestChangeFilter';
import GFWProtectedForestChangeFilter from '../GFWProtectedForestChangeFilter';
import ForestChangeFilter from '../ForestChangeFilter';

const FOREST_CHANGE_FILTER_LIST = [
  'Oil Palm Concessions',
  'RSPO Palm Concessions',
  'Palm Oil Mills',
];

interface ForestChangeFilterProps {
  listName: string;
  listData: [];
  filterCount: number;
  listView: string;
  adminAreas: [];
  history: [];
  protectedAreas: [];
  filterValues: {};
  maximumAnalysisAreaInTheList: number;
  clearFilters: () => void;
}

export const ForestChangeFilterDrawer = ({
  listName,
  listData,
  filterCount,
  listView,
  adminAreas,
  history,
  protectedAreas,
  filterValues,
  maximumAnalysisAreaInTheList,
  clearFilters,
}: ForestChangeFilterProps) => {
  if (FOREST_CHANGE_FILTER_LIST.includes(listName)) {
    return (
      <GFWForestChangeFilter
        listData={listData}
        filterCount={filterCount}
        listView={listView}
        list_name={listName}
        clearFilters={clearFilters}
      />
    );
  }

  if (listName === 'Administrative Areas') {
    return (
      <GFWAdminForestChangeFilter
        filterCount={filterCount}
        listView={listView}
        adminAreas={adminAreas}
        history={history}
      />
    );
  }

  if (listName === 'Protected Areas') {
    return (
      <GFWProtectedForestChangeFilter
        filterCount={filterCount}
        listView={listView}
        protectedAreas={protectedAreas}
        history={history}
        clearFilters={clearFilters}
      />
    );
  }

  return (
    <ForestChangeFilter
      listData={listData}
      filterValues={filterValues}
      filterCount={filterCount}
      listView={listView}
      maximumAnalysisAreaInTheList={maximumAnalysisAreaInTheList}
    />
  );
};
