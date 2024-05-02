import React, { useState } from 'react';
import Button from '../../../../../../common/js/components/Button';
import CustomTooltip from '../../../../../../common/js/components/CustomTooltip/CustomTooltip';
import CustomDraftDialog from '../../../../../../common/js/components/CustomDraftDialog/CustomDraftDialog';
import { locationsPage } from '../../../../../../common/js/config';
import './ListDiagnosticStatusDraft.scss';

const TOOLTIP__LABEL = 'DRAFT';
const TOOLTIP__MESSAGE =
  'This list contains unanalyzed locations. Please click the submit button to run analysis. Once submitted, your list will not be accessible until analysis is complete.';

const DIALOG_TITLE = 'Confirm analysis submission';
const DIALOG_MESSAGE =
  '<p>Click OK to submit this list for analysis. You will not be able to access the list until analysis is complete. You will receive an email notification when the update is completed.</p><p>Note that running analysis counts towards your account usage limits. See more information <a href="/about#fees">here</a>.</p>';

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
          dialogTitle={DIALOG_TITLE}
          dialogMessage={DIALOG_MESSAGE}
          dialogActionConfirm={() => {
            setDialogOpen(false);
            submitForAnalysis();
          }}
        />
      )}
    </div>
  );
}
