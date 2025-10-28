import { Component } from 'react';
import {
  Stack,
  Button as MaterialButton,
  Badge,
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
import InfoBubble from '../../../../../../common/js/components/InfoBubble';
import { Clear, FilterAlt } from '@mui/icons-material';
import {
  toggleCanopyModal,
  updateFilters,
  setFilterCount,
} from '../../../../../../locations/js/actions/locationActions';
import { defaultFilterValues } from '../../defaultFilterValues';
import Button from '../../../../../../common/js/components/Button';
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
import { ThemeProvider } from '../../../../../../styles/ThemeProvider';
import { filterKeys, gfwListNames } from '../../../../../../common/js/constants/lists.constants';
import { GFW_LISTS_NUMBER_CONSTANTS } from '../../../../../../../config/env/gfwLists.constants';
import store from '../../../../../../locations/js/store';
import '../../../../../../common/css/_irsBase.scss';
import '../../../../../../common/css/_irsStyle.scss';
import '../../../../../../common/css/filter-dialogs.scss';
import {
  COMMODITY_RISK_VIEW,
  FOREST_CHANGE_VIEW,
  POST_2020_RISK_ASSESSMENT_VIEW,
  ALERTS,
  forestDataSet,
} from '../listViews.constants';

export default class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = { ...defaultFilterValues, forestDataset: forestDataSet.NaturalForestMap };
    this.initialState = this.state;
  }

  changeCountry = (evt) => {
    this.setState({
      selectedCountry: evt.target.value,
      selectedState: '',
      selectedSubState: '',
    });
  };

  changeState = (evt) => {
    this.setState({ selectedState: evt.target.value, selectedSubState: '' });
  };

  changeSubState = (evt) => {
    this.setState({ selectedSubState: evt.target.value });
  };

  changeShowOnlyLocationsWithError = (evt) => {
    this.setState({ hasError: evt.target.checked }, () =>
      store.dispatch(updateFilters(this.state))
    );
  };

  changeDataSource = (event) => {
    this.setState({ forestDataset: event.target.value });
  };

  updateValues = (state) => {
    let filterCount = 0;
    Object.keys(state).forEach((key) => {
      if (filterKeys.includes(key) && !!state[key]) {
        filterCount += 1;
      }
    });

    store.dispatch(toggleCanopyModal());
    store.dispatch(updateFilters(state));
    store.dispatch(setFilterCount(filterCount));

    gtag('event', 'list table filter', {
      event_category: 'Lists Click',
      event_label: 'user filtered the lists table',
    });
  };

  resetFilters = () => {
    this.setState(this.initialState, () => {
      store.dispatch(toggleCanopyModal());
      store.dispatch(updateFilters(this.initialState));
      store.dispatch(setFilterCount(0));
    });
  };

  render() {
    const {
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
    } = this.props;
    const { selectedCountry, selectedState, selectedSubState } = this.state;

    const { countryList, stateList, subStateList } = filterCountryStateAndSubStateOptions(
      filterValues,
      selectedCountry,
      selectedState
    );
    const isCommodityRiskFilterVisible = listView === COMMODITY_RISK_VIEW;
    const isForestChangeFilterVisible = listView === FOREST_CHANGE_VIEW;

    const { PALM_OIL_MILLS, PROTECTED_AREAS, ADMINISTRATIVE_AREAS } = GFW_LISTS_NUMBER_CONSTANTS;

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

    return (
      <ThemeProvider>
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
            clearFilters={this.resetFilters}
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
            clearFilters={this.resetFilters}
            isListFiltered={isListFiltered}
          />
        )}
        {isGFWListCommodityRiskFilterVisible && (
          <GFWListCommodityRiskFilter
            filterValues={filterValues}
            parentCompanyOptionsForFilter={parentCompanyOptionsForFilter}
            isFilterModalVisible={isFilterModalVisible}
            clearFilters={this.resetFilters}
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
                    onCountryChange={this.changeCountry}
                    states={stateList}
                    selectedState={selectedState}
                    onStateChange={this.changeState}
                    subStates={subStateList}
                    selectedSubState={selectedSubState}
                    onSubStateChange={this.changeSubState}
                  />
                </Grid>
                <Grid item xs={3} sx={{ alignSelf: 'center' }}>
                  <Button
                    variant="primary"
                    data-cy="filter-apply-button"
                    onClick={() => this.updateValues(this.state)}
                    label="APPLY"
                  />
                  <Button
                    style={{ marginLeft: '10px' }}
                    variant="secondary"
                    onClick={this.resetFilters}
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
                          checked={this.state.hasError}
                          onChange={this.changeShowOnlyLocationsWithError}
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
                        size="small"
                        sx={{ width: 230, mt: shouldRenderLocationsWithErrorsCheckbox ? 1 : 0 }}
                      >
                        <InputLabel>Forest Dataset</InputLabel>
                        <Select
                          value={this.state.forestDataset}
                          onChange={this.changeDataSource}
                          label="Forest Dataset"
                        >
                          <MenuItem value={forestDataSet.NaturalForestMap}>
                            {forestDataSet.NaturalForestMap}
                          </MenuItem>
                          <MenuItem value={forestDataSet.JrcForestLoss}>
                            {forestDataSet.JrcForestLoss}
                          </MenuItem>
                        </Select>
                      </FormControl>
                      <InfoBubble />
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
                <MaterialButton
                  data-cy="filter-open-button"
                  sx={{ minWidth: '35px', '& > svg': { margin: 0 } }}
                  onClick={() => store.dispatch(toggleCanopyModal())}
                >
                  {!isFilterModalVisible && filterCount > 0 ? (
                    <Badge
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: '#97bd3d',
                          color: 'white',
                        },
                      }}
                      badgeContent={filterCount}
                      overlap="circular"
                    >
                      <FilterAlt
                        sx={{
                          color: 'black',
                          marginRight: '10px',
                          fontSize: '25px',
                          marginTop: '3px',
                        }}
                      />
                    </Badge>
                  ) : (
                    <FilterAlt
                      sx={{
                        color: 'black',
                        marginRight: '10px',
                        fontSize: '25px',
                        marginTop: '3px',
                      }}
                    />
                  )}
                </MaterialButton>
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
      </ThemeProvider>
    );
  }
}
