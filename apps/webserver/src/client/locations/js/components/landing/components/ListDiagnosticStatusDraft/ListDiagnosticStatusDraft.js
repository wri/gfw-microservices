import React, { useState } from 'react';
import Button from '../../../../../../common/js/components/Button';
import CustomTooltip from '../../../../../../common/js/components/CustomTooltip/CustomTooltip';
import CustomDraftDialog from '../../../../../../common/js/components/CustomDraftDialog/CustomDraftDialog';
import { locationsPage } from '../../../../../../common/js/config';
import './ListDiagnosticStatusDraft.scss';

const TOOLTIP__LABEL = 'DRAFT';
const TOOLTIP__MESSAGE =
  'This list contains unanalyzed locations. Please click the submit button to run analysis. Once submitted, your list will not be accessible until analysis is complete.';

export default function ListDiagnosticStatusDraft({ submitForAnalysis, hideSubmit }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRerunDialogState = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    setDialogOpen(true);
  };

  return (
    <div className="DiagnosticStatusDraft">
      <span className="DiagnosticStatusDraft__label">
        <CustomTooltip
          placement={'top'}
          label={TOOLTIP__LABEL}
          tooltipMessage={TOOLTIP__MESSAGE}
          iconWidth={13}
          iconHeight={16}
        />
      </span>

      {hideSubmit && (
        <Button
          onClick={(evt) => handleRerunDialogState(evt)}
          className="locations-list__submit-button"
          label={locationsPage.lists.submit}
          size="small"
          variant="primary"
        />
      )}

      {dialogOpen && (
        <CustomDraftDialog
          open={true}
          closeAction={() => setDialogOpen(false)}
          dialogTitle={locationsPage.lists.submitListDialog.title}
          dialogMessage={locationsPage.lists.submitListDialog.message}
          dialogActionConfirm={() => {
            setDialogOpen(false);
            submitForAnalysis();
          }}
        />
      )}
    </div>
  );
}
