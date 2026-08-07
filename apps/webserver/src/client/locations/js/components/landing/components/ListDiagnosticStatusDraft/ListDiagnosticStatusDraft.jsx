import { useState } from 'react';
import { PillButton } from '../../../../../../components';
import CustomTooltip from '../../../../../../common/js/components/CustomTooltip/CustomTooltip';
import CustomDialog from '../../../../../../common/js/components/CustomDialog/CustomDialog';
import { locationsPage } from '../../../../../../common/js/config';
import { useTransifexTranslation } from '../../../../../../hooks/useTransifexTranslation';
import './ListDiagnosticStatusDraft.scss';

const TOOLTIP__LABEL = 'DRAFT';
const TOOLTIP__MESSAGE =
  'This list contains unanalyzed locations. Please click the submit button to run analysis. Once submitted, your list will not be accessible until analysis is complete.';

export default function ListDiagnosticStatusDraft({ submitForAnalysis, hideSubmit }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const submitLabel = useTransifexTranslation(locationsPage.lists.submit);

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
        <PillButton
          variant="contained"
          size="small"
          sx={{ fontSize: '0.75rem', mr: 0.5, py: 0 }}
          onClick={handleRerunDialogState}
        >
          {submitLabel}
        </PillButton>
      )}

      {dialogOpen && (
        <CustomDialog
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
