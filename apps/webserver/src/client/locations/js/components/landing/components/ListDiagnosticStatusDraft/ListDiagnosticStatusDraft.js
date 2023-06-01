import React, { useState } from 'react';
import Button from '../../../../../../common/js/components/Button';
import CustomTooltip from '../../../../../../common/js/components/CustomTooltip/CustomTooltip';
import CustomDraftDialog from '../../../../../../common/js/components/CustomDraftDialog/CustomDraftDialog';
import { locationsPage } from '../../../../../../common/js/config';
import { requestGeoTrellisAnalyzeList } from '../../../../utils/request.utils';

import './ListDiagnosticStatusDraft.scss';

const TOOLTIP__LABEL = 'DRAFT';
const TOOLTIP__MESSAGE =
  'This list contains unanalyzed locations. Please click the submit button to run analysis. Once submitted, your list will not be accessible until analysis is complete.';

const DIALOG_TITLE = 'Confirm Submission';
const DIALOG_MESSAGE =
  'Click OK to submit this list for analysis. You will not be able to access the list until analysis is complete.';

export default function ListDiagnosticStatusDraft({ list }) {
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

      <Button
        onClick={(evt) => handleRerunDialogState(evt)}
        className="locations-list__submit-button"
        label={locationsPage.lists.submit}
        size="small"
        variant="primary"
      />

      {dialogOpen && (
        <CustomDraftDialog
          open={true}
          closeAction={() => setDialogOpen(false)}
          dialogTitle={DIALOG_TITLE}
          dialogMessage={DIALOG_MESSAGE}
          dialogActionConfirm={() => {
            requestGeoTrellisAnalyzeList(list)
              .then((response) => {
                gtag('event', 'Submit List', {
                  'event_category': 'Submit',
                  ''event_label'': 'User submits a list for analysis',
                });
                gtag('event', 'Submit List', {
                  'event_category': 'Submit',
                  ''event_label'': 'User submits a list from landing page',
                });
                // TODO: Get details what to do after list is submitted
                window.location.reload();
              })
              .catch((error) => {
                // TODO: Get details what to do after list submission fails
                console.log(error);
              })
              .finally(() => {
                setDialogOpen(false);
              });
          }}
        />
      )}
    </div>
  );
}
