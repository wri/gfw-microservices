import React from 'react';
import { numberWithCommas } from '../../../../locations/js/utils/locationsTableUtils';
import MultipleCountriesLabel from './MultipleCountriesLabel';
import './DiagnosticsHeaderInfo.scss';

function FullListDiagnosticsHeaderInfo({ selectedList }) {
  const { id, list_name, list_locations_count } = selectedList;

  return (
    <div className="diagnostics-header-info">
      <div className="diagnostics-header-info__location-count">
        {`${numberWithCommas(list_locations_count)} locations`}
      </div>
      <div className="header-title print-only">{list_name}</div>
      <MultipleCountriesLabel listId={id} />
    </div>
  );
}

export default FullListDiagnosticsHeaderInfo;
