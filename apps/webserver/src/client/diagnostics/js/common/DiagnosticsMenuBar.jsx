import React, { useEffect, useState } from 'react';
import GfwSelect from '../../../common/js/components/GfwSelect';
import Button from '../../../common/js/components/Button';
import IconReport from '../../../common/js/components/icon/IconReport';
import IconDownload from '../../../common/js/components/icon/IconDownload';
import printDiagnosticsReport from './printDiagnosticsReport';
import featureFlags from '../../../../utils/general.utils';
import {
  analysisTypes,
  analysisTypesOptions,
} from '../../../../config/env/analysisTypes.constants';
import { listStatus } from '../../../../config/env/listStatuses.constants';
import './DiagnosticsMenuBar.scss';

function DiagnosticsMenuBar({
  listId,
  isSharedList,
  downloadDiagnostics,
  selectedDiagnostics = analysisTypes.FOREST_CHANGE_DIAGNOSTICS,
  isGfwList,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeAnalysesIds, setActiveAnalysesIds] = useState([]);
  const { isAfiAvailable } = featureFlags;
  const { DEFORESTATION_KPIS, ALERTS } = analysisTypes;

  useEffect(() => {
    if (isGfwList) {
      setIsLoading(false);
      return;
    }
    fetch(`/api/list/${listId}/selectedAnalyses`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((response) => {
        let activeAnalysesIds = response
          .filter(({ status }) => status === listStatus.Active)
          .map(({ analysisId }) => analysisId);

        // removing Alerts from this menu because that analysis is not linked from here
        activeAnalysesIds = activeAnalysesIds.filter((analysisId) => analysisId !== ALERTS);

        if (!isAfiAvailable) {
          // remove AFI option if feature flag is off
          activeAnalysesIds = activeAnalysesIds.filter(
            (analysisId) => analysisId !== DEFORESTATION_KPIS
          );
        }

        setActiveAnalysesIds(activeAnalysesIds);
        setIsLoading(false);
      })
      .catch((error) => {
        console.warn(error);
        setIsLoading(false);
      });
  }, []);

  const diagnosticOptions = activeAnalysesIds.map((analysisId) => ({
    value: analysisId,
    label: analysisTypesOptions.find(({ id }) => id === analysisId).label,
  }));

  const redirectToSelectedDiagnostics = (diagnostics) => {
    const diagnosticTypeParam = !isGfwList ? `&type=${diagnostics}` : '';
    window.location.href = `/diagnostics?listId=${listId}${diagnosticTypeParam}${
      isSharedList ? '&shared=true' : ''
    }`;
  };

  return (
    <div className="diagnostics-menu-bar">
      <div className="diagnostics-menu-bar__action-bar">
        <div className="diagnostics-menu-bar__actions-group">
          {!isLoading && !isGfwList && (
            <>
              <label htmlFor="viewToggle">Diagnostic</label>
              <GfwSelect
                id="viewToggle"
                name="viewToggleName"
                onChange={(evt) => redirectToSelectedDiagnostics(evt.value)}
                value={{ value: selectedDiagnostics }}
                options={diagnosticOptions}
              />
            </>
          )}
        </div>
        <div className="diagnostics-menu-bar__actions-group">
          <Button
            variant="secondary"
            label="Report"
            onClick={() => printDiagnosticsReport(selectedDiagnostics)}
            icon={<IconReport height="18" />}
          />
          <Button
            variant="secondary"
            label="Download"
            onClick={downloadDiagnostics}
            icon={<IconDownload height="18" />}
          />
        </div>
      </div>
    </div>
  );
}

export default DiagnosticsMenuBar;
