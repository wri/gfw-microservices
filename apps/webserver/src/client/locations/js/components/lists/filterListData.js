import store from '../../store';
import { checkValid, getLastValue } from '../../utils/locationsTableUtils';
import { updateFilteredData } from '../../actions/locationActions';

// Filter a list based on filtered values
const filterListData = (listData, filters, selectedLists, getAdministrativeAreasData, getProtectedAreasData) => {
  if (Object.keys(filters).length > 0 && selectedLists.list_name === 'Administrative Areas') {
    getAdministrativeAreasData({ filters, id: selectedLists.id });
  } else if (Object.keys(filters).length > 0 && selectedLists.list_name === 'Protected Areas') {
    getProtectedAreasData({ filters, id: selectedLists.id });
  } else if (Object.keys(filters).length > 0) {
    const tempListData = listData.filter((location) => {
      let found = true;
      Object.keys(filters).forEach((key) => {
        // FOREST CHANGE FILTERS
        if (key === 'selectedCountry' && filters[key] !== '') {
          found = filters[key] === location.Country;
        }
        if (found && key === 'selectedState' && filters[key] !== '') {
          found = filters[key] === location.State;
        }
        if (found && key === 'selectedSubState' && filters[key] !== '') {
          found = filters[key] === location['Sub State'];
        }
        if (found && key === 'selectedParentCompany' && filters[key] !== '') {
          found = filters[key] === location['Parent Company'];
        }
        if (found && key === 'selectedSupplier' && filters[key] !== '') {
          found = filters[key] === location['Supplier Name'];
        }
        if (found && key === 'selectedSecondSupplier' && filters[key] !== '') {
          found = filters[key] === location['Second Supplier Name'];
        }
        if (found && key === 'selectedAreaMin' && filters[key] !== 0) {
          found = location.total_area >= filters[key];
        }
        if (found && key === 'selectedAreaMax' && filters[key]) {
          found = location.total_area <= filters[key];
        }
        if (found && key === 'showTreeCoverExtent' && filters[key]) {
          found =
            (location.tree_cover_extent_total / location['Analysis Area']) * 100 >= filters.treeCoverExtentMin &&
            (location.tree_cover_extent_total / location['Analysis Area']) * 100 <= filters.treeCoverExtentMax;
        }
        if (found && key === 'showTreeCoverLoss' && filters[key]) {
          found =
            (location.tree_cover_loss_total_yearly / location['Analysis Area']) * 100 >= filters.treeCoverLossMin &&
            (location.tree_cover_loss_total_yearly / location['Analysis Area']) * 100 <= filters.treeCoverLossMax;
        }
        if (found && key === 'showTreeCoverLossProtectedAreas' && filters[key]) {
          found =
            (location.tree_cover_loss_protected_areas_yearly / location['Analysis Area']) * 100 >=
              filters.treeCoverLossProtectedAreasMin &&
            (location.tree_cover_loss_protected_areas_yearly / location['Analysis Area']) * 100 <=
              filters.treeCoverLossProtectedAreasMax;
        }
        if (found && key === 'showTreeCoverLossPrimaryForest' && filters[key]) {
          found =
            (location.tree_cover_loss_primary_forest_yearly / location['Analysis Area']) * 100 >=
              filters.treeCoverLossPrimaryForestMin &&
            (location.tree_cover_loss_primary_forest_yearly / location['Analysis Area']) * 100 <=
              filters.treeCoverLossPrimaryForestMax;
        }
        if (found && key === 'showRSPOCertified' && filters[key] && location?.Certification) {
          found = location.Certification.includes('RSPO');
        }
        if (found && key === 'selectedMillPriority' && filters[key].length > 0) {
          const value = location.commodity_mill_priority_level;
          if (checkValid(value)) {
            found =
              (filters[key].includes('low') && getLastValue(value) === 0) ||
              (filters[key].includes('medium') && getLastValue(value) === 1) ||
              (filters[key].includes('high') && getLastValue(value) === 2);
          }
        }
        if (found && key === 'selectedOverallThreats' && filters[key].length > 0) {
          const value = location.commodity_threat_overall_level;
          if (checkValid(value)) {
            found =
              (filters[key].includes('low') && getLastValue(value) === 0) ||
              (filters[key].includes('medium') && getLastValue(value) === 1) ||
              (filters[key].includes('high') && getLastValue(value) === 2);
          }
        }
        if (found && key === 'selectedOverallValues' && filters[key].length > 0) {
          const value = location.commodity_value_overall_level;
          if (checkValid(value)) {
            found =
              (filters[key].includes('low') && getLastValue(value) === 0) ||
              (filters[key].includes('medium') && getLastValue(value) === 1) ||
              (filters[key].includes('high') && getLastValue(value) === 2);
          }
        }
        if (found && key === 'selectedNames' && filters[key].length > 0) {
          found = filters[key].includes(location['Location Name']);
        }
      });
      return found;
    });
    const filteredIds = tempListData.map((d) => d.location_id);
    store.dispatch(updateFilteredData(filteredIds));
  } else {
    const dataIds = listData.map((d) => d.location_id);
    store.dispatch(updateFilteredData(dataIds));
  }

  ga('send', 'event', 'Lists Click', 'List table filter', 'user filtered the lists table');
};

export default filterListData;
