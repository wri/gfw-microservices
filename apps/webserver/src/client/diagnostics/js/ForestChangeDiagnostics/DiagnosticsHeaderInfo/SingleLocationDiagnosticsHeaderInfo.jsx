import React from 'react';
import './DiagnosticsHeaderInfo.scss';

function SingleLocationDiagnosticsHeaderInfo({ selectedListName, currentLocation }) {
  const {
    ['Investment Name']: investmentNameColumn,
    ['Location Name']: locationNameColumn,
    State: state,
    Country: country,
  } = currentLocation;

  const locationName = investmentNameColumn ?? locationNameColumn;

  return (
    <div className="diagnostics-header-info">
      <div>{locationName}</div>
      <div className="header-title print-only">{selectedListName}</div>
      <span className="list-country-name">{`${state}, ${country}`}</span>
    </div>
  );
}

export default SingleLocationDiagnosticsHeaderInfo;
