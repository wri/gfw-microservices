import { useEffect, useState } from 'react';
import GfwSelect from '../../../common/js/components/GfwSelect';
import { PillButton } from '../../../components';
import IconReport from '../../../common/js/components/icon/IconReport';
import IconDownload from '../../../common/js/components/icon/IconDownload';
import printDiagnosticsReport from './printDiagnosticsReport';
import { analysisTypes, analysisTypesForUI } from '../../../../config/env/analysisTypes.constants';
import { listStatus } from '../../../../config/env/listStatuses.constants';
import { analysisTypesOptionsNewNames } from '../../../../config/env/analysisTypes.constants';
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
  const { ALERTS } = analysisTypes;

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

        setActiveAnalysesIds(activeAnalysesIds);
        setIsLoading(false);
      })
      .catch((error) => {
        console.warn(error);
        setIsLoading(false);
      });
  }, []);

  const diagnosticOptions = activeAnalysesIds
    .filter(
      (analysisId) => analysisTypesOptionsNewNames.find(({ id }) => id === analysisId)?.showInUI
    )
    .map((analysisId) => ({
      value: analysisId,
      label: analysisTypesForUI.find(({ id }) => id === analysisId)?.label,
    }));

  const redirectToSelectedDiagnostics = (diagnostics) => {
    const locationId = parseInt(new URLSearchParams(location.search).get('locationId'), 10);
    const diagnosticTypeParam = !isGfwList ? `&type=${diagnostics}` : '';
    let url = `/diagnostics?listId=${listId}${diagnosticTypeParam}${
      isSharedList ? '&shared=true' : ''
    }`;

    if (locationId !== undefined && !isNaN(locationId)) {
      url += `&locationId=${locationId}`;
    }

    window.location.href = url;
  };

  return (
    <div className="diagnostics-menu-bar">
      <div className="diagnostics-menu-bar__action-bar">
        <div className="diagnostics-menu-bar__actions-group">
          {!isLoading && !isGfwList && diagnosticOptions.length && (
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
          <PillButton
            variant="contained"
            color="info"
            size="small"
            onClick={() => printDiagnosticsReport(selectedDiagnostics)}
            startIcon={<IconReport height="14" />}
          >
            Report
          </PillButton>
          <PillButton
            variant="contained"
            color="info"
            size="small"
            onClick={downloadDiagnostics}
            data-cy="download-diagnostics"
            startIcon={<IconDownload height="14" />}
            sx={{ ml: 1 }}
          >
            Download
          </PillButton>
        </div>
      </div>
    </div>
  );
}

export default DiagnosticsMenuBar;
