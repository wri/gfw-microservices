import React from 'react';
import { numberWithCommas } from '../../../../locations/js/utils/locationsTableUtils';
import MultipleCountriesLabel from './MultipleCountriesLabel';
import './DiagnosticsHeaderInfo.scss';

function FullListDiagnosticsHeaderInfo({ selectedLists }) {
  return (
    <div className="diagnostics-header-info">
      <div className="diagnostics-header-info__location-count">
        {`${numberWithCommas(selectedLists[0].list_locations_count)} locations`}
      </div>
      <div className="header-title print-only">{selectedLists[0].list_name}</div>
      <MultipleCountriesLabel listId={selectedLists[0].id} />
    </div>
  );
}

export default FullListDiagnosticsHeaderInfo;
