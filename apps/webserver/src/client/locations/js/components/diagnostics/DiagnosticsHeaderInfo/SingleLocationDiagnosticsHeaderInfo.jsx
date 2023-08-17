import React from 'react';
import './DiagnosticsHeaderInfo.scss';

function SingleLocationDiagnosticsHeaderInfo({ selectedLists, filteredLocations }) {
  const [loc] = filteredLocations?.length > 0 ? filteredLocations: selectedLists;
  const locationName = loc['Investment Name'] ?? loc['Location Name'];

  return (
    <div className="diagnostics-header-info">
      <div>{locationName}</div>
      <div className="header-title print-only">{selectedLists[0].list_name}</div>
      <span className="list-country-name">{`${loc.State}, ${loc.Country}`}</span>
    </div>
  );
}

export default SingleLocationDiagnosticsHeaderInfo;
