import store from '../../../../locations/js/store';
import { checkValid, getLastValue } from '../../../../locations/js/utils/locationsTableUtils';
import { updateFilteredData } from '../../../../locations/js/actions/locationActions';

// Main function
const filterListData = (
  listData,
  filters,
  selectedLists,
  getAdministrativeAreasData,
  getProtectedAreasData,
  page = 0
) => {
  const hasFilters = Object.keys(filters).length > 0;

  if (hasFilters) {
    // Handle special lists with backend data
    if (selectedLists.list_name === 'Administrative Areas') {
      return getAdministrativeAreasData({ filters, id: selectedLists.id, page });
    }
    if (selectedLists.list_name === 'Protected Areas') {
      return getProtectedAreasData({ filters, id: selectedLists.id, page });
    }

    // Apply filters locally
    const filteredIds = listData
      .filter((location) =>
        Object.entries(filters).every(([key, value]) => {
          // Skip empty filter values
          if (!value || (Array.isArray(value) && value.length === 0)) {
            return true;
          }

          const handler = filterHandlers[key];
          return handler ? handler(location, value, filters) : true;
        })
      )
      .map((d) => d.location_id);

    store.dispatch(updateFilteredData(filteredIds));
  } else {
    // No filters → include all
    const allIds = listData.map((d) => d.location_id);
    store.dispatch(updateFilteredData(allIds));
  }

  gtag('event', 'list table filter', {
    event_category: 'Lists Click',
    event_label: 'user filtered the lists table',
  });
};

// Handlers for different filter keys
const filterHandlers = {
  selectedCountry: (location, value) => value === location.Country,
  selectedState: (location, value) => value === location.State,
  selectedSubState: (location, value) => value === location['Sub State'],
  selectedParentCompany: (location, value) => value === location['Parent Company'],
  selectedSupplier: (location, value) => value === location['Supplier Name'],
  selectedSecondSupplier: (location, value) => value === location['Second Supplier Name'],

  selectedAreaMin: (location, value) => location.total_area >= value,
  selectedAreaMax: (location, value) => location.total_area <= value,

  showTreeCoverExtent: (location, _value, filters) => {
    const percentageExtent = (location.tree_cover_extent_total / location['Analysis Area']) * 100;
    return (
      percentageExtent >= filters.treeCoverExtentMin &&
      percentageExtent <= filters.treeCoverExtentMax
    );
  },

  showTreeCoverLoss: (location, _value, filters) => {
    const percentageLoss =
      (location.tree_cover_loss_total_yearly / location['Analysis Area']) * 100;
    return percentageLoss >= filters.treeCoverLossMin && percentageLoss <= filters.treeCoverLossMax;
  },

  showTreeCoverLossProtectedAreas: (location, _value, filters) => {
    const percentageLossProtectedAreas =
      (location.tree_cover_loss_protected_areas_yearly / location['Analysis Area']) * 100;
    return (
      percentageLossProtectedAreas >= filters.treeCoverLossProtectedAreasMin &&
      percentageLossProtectedAreas <= filters.treeCoverLossProtectedAreasMax
    );
  },

  showTreeCoverLossPrimaryForest: (location, _value, filters) => {
    const percentageLossPrimaryForest =
      (location.tree_cover_loss_primary_forest_yearly / location['Analysis Area']) * 100;
    return (
      percentageLossPrimaryForest >= filters.treeCoverLossPrimaryForestMin &&
      percentageLossPrimaryForest <= filters.treeCoverLossPrimaryForestMax
    );
  },

  showRSPOCertified: (location) => location?.Certification?.includes('RSPO'),

  selectedMillPriority: (location, values) => {
    const priorityValue = location.commodity_mill_priority_level;
    return (
      checkValid(priorityValue) &&
      ((values.includes('low') && getLastValue(priorityValue) === 0) ||
        (values.includes('medium') && getLastValue(priorityValue) === 1) ||
        (values.includes('high') && getLastValue(priorityValue) === 2))
    );
  },

  selectedOverallThreats: (location, values) => {
    const threatValue = location.commodity_threat_overall_level;
    return (
      checkValid(threatValue) &&
      ((values.includes('low') && getLastValue(threatValue) === 0) ||
        (values.includes('medium') && getLastValue(threatValue) === 1) ||
        (values.includes('high') && getLastValue(threatValue) === 2))
    );
  },

  selectedOverallValues: (location, values) => {
    const valueLevel = location.commodity_value_overall_level;
    return (
      checkValid(valueLevel) &&
      ((values.includes('low') && getLastValue(valueLevel) === 0) ||
        (values.includes('medium') && getLastValue(valueLevel) === 1) ||
        (values.includes('high') && getLastValue(valueLevel) === 2))
    );
  },

  selectedNames: (location, values) => values.includes(location['Location Name']),
};

export default filterListData;
