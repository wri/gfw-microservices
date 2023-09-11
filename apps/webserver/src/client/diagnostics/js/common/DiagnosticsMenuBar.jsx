import React from 'react';
import GfwSelect from '../../../common/js/components/GfwSelect';
import Button from '../../../common/js/components/Button';
import IconReport from '../../../common/js/components/icon/IconReport';
import IconDownload from '../../../common/js/components/icon/IconDownload';
import printDiagnosticsReport from './printDiagnosticsReport';
import './DiagnosticsMenuBar.scss';

function DiagnosticsMenuBar({
  listId,
  isSharedList,
  downloadDiagnostics,
  selectedDiagnostics = 'FCD',
  availableDiagnostics = [],
}) {
  const diagnosticOptions = [
    { value: 'FCD', label: 'Forest change' },
    { value: 'AFI', label: 'EUDR' },
    // ...availableDiagnostics
  ];

  const redirectToSelectedDiagnostics = (diagnostics) => {
    window.location.href = `/diagnostics?listId=${listId}&type=${diagnostics}${
      isSharedList ? '&shared=true' : ''
    }`;
  };

  return (
    <div className="diagnostics-menu-bar">
      <div className="diagnostics-menu-bar__action-bar">
        <div className="diagnostics-menu-bar__actions-group">
          <label htmlFor="viewToggle">Diagnostic</label>
          <GfwSelect
            id="viewToggle"
            name="viewToggleName"
            onChange={(evt) => redirectToSelectedDiagnostics(evt.value)}
            value={{ value: selectedDiagnostics }}
            options={diagnosticOptions}
          />
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
