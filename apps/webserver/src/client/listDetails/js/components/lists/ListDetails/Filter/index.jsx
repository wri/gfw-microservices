import { useState, useMemo } from 'react';
import {
  Stack,
  Button as MaterialButton,
  Box,
  Grid,
  Typography,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Clear } from '@mui/icons-material';
import {
  toggleCanopyModal,
  updateFilters,
  setFilterCount,
} from '../../../../../../locations/js/actions/locationActions';
import store from '../../../../../../locations/js/store';
import { defaultFilterValues } from '../../defaultFilterValues';

import CountryStateSubStateFilter from './CountryStateSubStateFilter';
import ColumnSelector from '../ColumnSelector';
import GFWListCommodityRiskFilter from './GFWListCommodityRiskFilter';
import UserListCommodityRiskFilter from './UserListCommodityRiskFilter';
import ProtectedAreasGFWList from './ProtectedAreasGFWListFilter';
import AdministrativeAreasGFWListFilter from './AdministrativeAreasGFWListFilter';
import GFWListFilter from './GFWListFilter';
import NaturalForestLossDataSourceToggle from './NaturalForestLossDataSourceToggle';
import DeforestationDisplayFormatToggleButtons from '../DeforestationDisplayFormatToggleButtons';
import filterCountryStateAndSubStateOptions from './filterCountryStateAndSubStateOptions';
import FilterButton from './FilterButton';

import '../../../../../../common/css/_irsBase.scss';
import '../../../../../../common/css/_irsStyle.scss';
import '../../../../../../common/css/filter-dialogs.scss';
import { filterKeys, gfwListNames } from '../../../../../../common/js/constants/lists.constants';
import InfoBubble from '../../../../../../common/js/components/InfoBubble';
import { default as GFWProButton } from '../../../../../../common/js/components/Button';
import infoBubbleConfig from '../../../../../../common/js/infoBubbleConfig.constants';
import {
  COMMODITY_RISK_VIEW,
  FOREST_CHANGE_VIEW,
  POST_2020_RISK_ASSESSMENT_VIEW,
  ALERTS,
  forestDataSet,
} from '../listViews.constants';

import { GFW_LISTS_NUMBER_CONSTANTS } from '../../../../../../../config/env/gfwLists.constants';

export default function Filter({
  filterValues,
  parentCompanyOptionsForFilter,
  supplierNameOptionsForFilter,
  secondSupplierNameOptionsForFilter,
  isFilterModalVisible,
  filterCount,
  listColumns,
  visibleColumns,
  setListColumns,
  listView,
  listName,
  adminAreas,
  protectedAreas,
  isGfwList,
  areAllAnalysesDraft,
  isListWithErrors,
  forestDataset,
  onForestDatasetChange,
}) {
  const [state, setState] = useState({ ...defaultFilterValues });

  const changeCountry = (evt) => {
    setState((prevState) => ({
      ...prevState,
      selectedCountry: evt.target.value,
      selectedState: '',
      selectedSubState: '',
    }));
  };

  const changeState = (evt) => {
    setState((prevState) => ({
      ...prevState,
      selectedState: evt.target.value,
      selectedSubState: '',
    }));
  };

  const changeSubState = (evt) => {
    setState((prevState) => ({ ...prevState, selectedSubState: evt.target.value }));
  };

  const changeShowOnlyLocationsWithError = (evt) => {
    const newState = { ...state, hasError: evt.target.checked };
    setState(newState);
    store.dispatch(updateFilters(newState));
  };

  const updateValues = (currentState) => {
    let filterCount = 0;
    Object.keys(currentState).forEach((key) => {
      if (filterKeys.includes(key) && !!currentState[key]) {
        filterCount += 1;
      }
    });

    store.dispatch(toggleCanopyModal());
    store.dispatch(updateFilters(currentState));
    store.dispatch(setFilterCount(filterCount));

    gtag('event', 'list table filter', {
      event_category: 'Lists Click',
      event_label: 'user filtered the lists table',
    });
  };

  const resetFilters = () => {
    setState({ ...defaultFilterValues });
    store.dispatch(toggleCanopyModal());
    store.dispatch(updateFilters({ ...defaultFilterValues }));
    store.dispatch(setFilterCount(0));
  };

  const { selectedCountry, selectedState, selectedSubState } = state;

  const { countryList, stateList, subStateList } = useMemo(
    () => filterCountryStateAndSubStateOptions(filterValues, selectedCountry, selectedState),
    [filterValues, selectedCountry, selectedState]
  );

  const { PALM_OIL_MILLS, PROTECTED_AREAS, ADMINISTRATIVE_AREAS } = GFW_LISTS_NUMBER_CONSTANTS;

  // Memoize all computed visibility flags
  const filterVisibility = useMemo(() => {
    const isCommodityRiskFilterVisible = listView === COMMODITY_RISK_VIEW;
    const isForestChangeFilterVisible = listView === FOREST_CHANGE_VIEW;

    const isUserListCommodityRiskFilterVisible = isCommodityRiskFilterVisible && !isGfwList;
    const isGFWListCommodityRiskFilterVisible =
      isCommodityRiskFilterVisible && isGfwList && listName === gfwListNames[PALM_OIL_MILLS - 1];

    const isProtectedAreasFilterVisible =
      isForestChangeFilterVisible && listName === gfwListNames[PROTECTED_AREAS - 1] && isGfwList;
    const isAdministrativeAreasFilterVisible =
      isForestChangeFilterVisible &&
      listName === gfwListNames[ADMINISTRATIVE_AREAS - 1] &&
      isGfwList;

    const isGFWListOtherThanProtectedOrAdministrativeAreas =
      isForestChangeFilterVisible &&
      isGfwList &&
      !isProtectedAreasFilterVisible &&
      !isAdministrativeAreasFilterVisible;

    const isInlineFilterVisible =
      isFilterModalVisible && !isGfwList && !isCommodityRiskFilterVisible;
    const isListFiltered = filterCount > 0;

    const shouldRenderLocationsWithErrorsCheckbox = !isInlineFilterVisible && isListWithErrors;

    return {
      isCommodityRiskFilterVisible,
      isUserListCommodityRiskFilterVisible,
      isGFWListCommodityRiskFilterVisible,
      isProtectedAreasFilterVisible,
      isAdministrativeAreasFilterVisible,
      isGFWListOtherThanProtectedOrAdministrativeAreas,
      isInlineFilterVisible,
      isListFiltered,
      shouldRenderLocationsWithErrorsCheckbox,
    };
  }, [
    listView,
    isGfwList,
    listName,
    isFilterModalVisible,
    filterCount,
    isListWithErrors,
    PALM_OIL_MILLS,
    PROTECTED_AREAS,
    ADMINISTRATIVE_AREAS,
  ]);

  const {
    isCommodityRiskFilterVisible,
    isUserListCommodityRiskFilterVisible,
    isGFWListCommodityRiskFilterVisible,
    isProtectedAreasFilterVisible,
    isAdministrativeAreasFilterVisible,
    isGFWListOtherThanProtectedOrAdministrativeAreas,
    isInlineFilterVisible,
    isListFiltered,
    shouldRenderLocationsWithErrorsCheckbox,
  } = filterVisibility;

  return (
    <>
      {isProtectedAreasFilterVisible && (
        <ProtectedAreasGFWList
          protectedAreas={protectedAreas}
          isFilterModalVisible={isFilterModalVisible}
        />
      )}

      {isAdministrativeAreasFilterVisible && (
        <AdministrativeAreasGFWListFilter
          adminAreas={adminAreas}
          isFilterModalVisible={isFilterModalVisible}
        />
      )}

      {isGFWListOtherThanProtectedOrAdministrativeAreas && (
        <GFWListFilter
          filterValues={filterValues}
          parentCompanyOptionsForFilter={parentCompanyOptionsForFilter}
          list_name={listName}
          isFilterModalVisible={isFilterModalVisible}
          clearFilters={resetFilters}
          isListFiltered={isListFiltered}
        />
      )}

      {isUserListCommodityRiskFilterVisible && (
        <UserListCommodityRiskFilter
          listName={listName}
          isFilterModalVisible={isFilterModalVisible}
          filterValues={filterValues}
          parentCompanyOptionsForFilter={parentCompanyOptionsForFilter}
          supplierNameOptionsForFilter={supplierNameOptionsForFilter}
          secondSupplierNameOptionsForFilter={secondSupplierNameOptionsForFilter}
          clearFilters={resetFilters}
          isListFiltered={isListFiltered}
        />
      )}
      {isGFWListCommodityRiskFilterVisible && (
        <GFWListCommodityRiskFilter
          filterValues={filterValues}
          parentCompanyOptionsForFilter={parentCompanyOptionsForFilter}
          isFilterModalVisible={isFilterModalVisible}
          clearFilters={resetFilters}
          isListFiltered={isListFiltered}
        />
      )}
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        sx={{ pt: 2, pb: 0.5 }}
      >
        <Grid container>
          {isInlineFilterVisible ? (
            <>
              <Grid container item xs={8} spacing={3}>
                <CountryStateSubStateFilter
                  countries={countryList}
                  selectedCountry={selectedCountry}
                  onCountryChange={changeCountry}
                  states={stateList}
                  selectedState={selectedState}
                  onStateChange={changeState}
                  subStates={subStateList}
                  selectedSubState={selectedSubState}
                  onSubStateChange={changeSubState}
                />
              </Grid>
              <Grid item xs={3} sx={{ alignSelf: 'center' }}>
                <GFWProButton
                  variant="primary"
                  data-cy="filter-apply-button"
                  onClick={() => updateValues(state)}
                  label="APPLY"
                />
                <GFWProButton
                  style={{ marginLeft: '10px' }}
                  variant="secondary"
                  onClick={resetFilters}
                  label="CLEAR"
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={4}>
                {listView === POST_2020_RISK_ASSESSMENT_VIEW && !areAllAnalysesDraft && (
                  <NaturalForestLossDataSourceToggle />
                )}
                {shouldRenderLocationsWithErrorsCheckbox && (
                  <FormControlLabel
                    sx={{ pl: 0.75 }}
                    control={
                      <Checkbox
                        checked={state.hasError}
                        onChange={changeShowOnlyLocationsWithError}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ textTransform: 'none' }}>
                        Show only locations with errors
                      </Typography>
                    }
                  />
                )}
                {listView === ALERTS && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormControl
                      data-cy="alerts-land-cover-select-container"
                      size="small"
                      sx={{ width: 230, mt: shouldRenderLocationsWithErrorsCheckbox ? 1 : 0 }}
                    >
                      <InputLabel data-cy="alerts-land-cover-label">Land Cover Dataset</InputLabel>
                      <Select
                        data-cy="alerts-land-cover-select"
                        value={forestDataset}
                        onChange={onForestDatasetChange}
                        label="Land Cover Dataset"
                      >
                        <MenuItem value={forestDataSet.NaturalForestMap}>
                          {forestDataSet.NaturalForestMap}
                        </MenuItem>
                        <MenuItem value={forestDataSet.JrcForestLoss}>
                          {forestDataSet.JrcForestLoss}
                        </MenuItem>
                      </Select>
                    </FormControl>
                    <InfoBubble infoBubbleId={infoBubbleConfig.recentDistAlertsLandCoverDataset} />
                  </Box>
                )}
              </Grid>
              <Grid item xs={shouldRenderLocationsWithErrorsCheckbox ? 5 : 7}>
                {!isCommodityRiskFilterVisible && !areAllAnalysesDraft && (
                  <DeforestationDisplayFormatToggleButtons />
                )}
              </Grid>
            </>
          )}
          <Grid item xs={1} sx={{ alignSelf: 'center', marginLeft: 'auto' }}>
            <Box flexGrow={1} />
            <Stack alignItems="center" direction="row">
              <FilterButton
                isFilterModalVisible={isFilterModalVisible}
                filterCount={filterCount}
                onClick={() => store.dispatch(toggleCanopyModal())}
              />
              {isInlineFilterVisible && (
                <MaterialButton
                  data-cy="filter-close-button"
                  sx={{ minWidth: '35px', '& > svg': { margin: 0 } }}
                  onClick={() => store.dispatch(toggleCanopyModal())}
                >
                  <Clear sx={{ color: 'black' }} />
                </MaterialButton>
              )}
              {!isFilterModalVisible && (
                <ColumnSelector
                  listColumns={listColumns}
                  visibleColumns={visibleColumns}
                  setListColumns={setListColumns}
                />
              )}
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
}
