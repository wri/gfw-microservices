import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardActions, Modal, IconButton, Icon } from '@mui/material';
import isEqual from 'lodash/isEqual';
import Button from '../../../../../common/js/components/Button';
import AnalysisTypesSelector from '../../../../../common/js/components/AnalysisTypesSelector';
import { listStatus } from '../../../../../../config/env/listStatuses.constants';
import InlineLoader from '../../../../../common/js/components/Loaders/InlineLoader';
import './ChangeTypeOfAnalysisModal.scss';

const AddAnalysisTypeConfirmationMessage = () => {
  return (
    <>
      <p>
        You have added a new analysis to your list. Upon submission, your list will be sent to
        analysis and will not be accessible until the analysis is complete.
      </p>
      <p>
        Newly-added analyses will be processed immediately. Existing analyses will remain unchanged.
        List Update date will reflect the oldest analysis. See more information{' '}
        <a
          href="/about?section=Fees"
          target="_blank"
          style={{ color: '#97bd3d', textDecoration: 'underline' }}
        >
          here
        </a>
        .
      </p>
    </>
  );
};

function ChangeTypeOfAnalysisModal({
  listId,
  setIsChangeTypeOfAnalysisModalOpen,
  isChangeTypeOfAnalysisModalOpen,
  listAnalysesStatus,
  commodity,
  isPalmRiskActive,
}) {
  const initialAnalysisSelection = listAnalysesStatus.map(({ analysisId }) => analysisId);
  const [selectedAnalysis, setSelectedAnalysis] = useState(initialAnalysisSelection);
  const [isAddingAnalysis, setIsAddingAnalysis] = useState(false);
  const [newAnalysesToRun, setNewAnalysesToRun] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const newlyAdded = selectedAnalysis.filter((id) => !initialAnalysisSelection.includes(id));

    setNewAnalysesToRun(newlyAdded);
    setIsAddingAnalysis(newlyAdded.length > 0);
  }, [selectedAnalysis]);

  const saveAnalysisSelection = useCallback(
    (saveAsDraft = false) =>
      fetch(`/api/list/${listId}/selectedAnalyses`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saveAsDraft,
          selectedAnalysis,
          isAddingAnalysis,
          newAnalysesToRun,
        }),
      }),
    [selectedAnalysis, isAddingAnalysis, newAnalysesToRun]
  );

  const saveAsDraft = async () => {
    try {
      setIsLoading(true);
      await saveAnalysisSelection(true);
      setIsChangeTypeOfAnalysisModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.warn(error);
      setIsLoading(false);
    }
  };

  const submitSelectedAnalysis = async () => {
    try {
      setIsLoading(true);
      await saveAnalysisSelection();
      setIsChangeTypeOfAnalysisModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.warn(error);
      setIsLoading(false);
    }
  };

  const revertChanges = () => {
    setSelectedAnalysis(initialAnalysisSelection);
  };

  const isSelectionUnchanged = isEqual(selectedAnalysis.sort(), initialAnalysisSelection.sort());

  const hasDraftInSelection = selectedAnalysis.some((analysisId) => {
    const match = listAnalysesStatus.find((item) => item.analysisId === analysisId);
    return match?.status === listStatus.Draft;
  });
  return (
    <>
      <Modal
        open={isChangeTypeOfAnalysisModalOpen}
        onClose={() => setIsChangeTypeOfAnalysisModalOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Card sx={{ minWidth: 275 }} className="change-type-of-analysis-modal">
          <CardContent>
            <IconButton
              onClick={() => setIsChangeTypeOfAnalysisModalOpen(false)}
              className="change-type-of-analysis-modal__close-button"
              aria-label="close"
            >
              <Icon>close</Icon>
            </IconButton>
            <AnalysisTypesSelector
              selectedAnalyses={selectedAnalysis}
              setSelectedAnalyses={setSelectedAnalysis}
              commodity={commodity}
              isPalmRiskActive={isPalmRiskActive}
            />
          </CardContent>
          <CardActions>
            {isLoading ? (
              <InlineLoader />
            ) : (
              <>
                {isAddingAnalysis ? (
                  <ButtonWithConfirmationPrompt
                    buttonLabel="Submit Analysis"
                    confirmationMessage={<AddAnalysisTypeConfirmationMessage />}
                    disabled={selectedAnalysis.every((analysis) =>
                      initialAnalysisSelection.includes(analysis)
                    )}
                    onConfirm={submitSelectedAnalysis}
                    onCancel={revertChanges}
                  />
                ) : (
                  <>
                    <Button
                      variant="primary"
                      disabled={
                        !selectedAnalysis.length || (isSelectionUnchanged && !hasDraftInSelection)
                      }
                      onClick={submitSelectedAnalysis}
                      label="Submit Analysis"
                    />
                  </>
                )}
                <Button
                  variant="primary"
                  disabled={isSelectionUnchanged}
                  onClick={saveAsDraft}
                  label="Save as Draft"
                />
              </>
            )}
          </CardActions>
        </Card>
      </Modal>
    </>
  );
}

function ButtonWithConfirmationPrompt(props) {
  const {
    buttonLabel = 'OK',
    confirmationMessage = 'Are you sure?',
    confirmationButtonLabel = 'Ok',
    onConfirm = () => void undefined,
    onCancel = () => void undefined,
    disabled = false,
  } = props;
  const [isThisModalOpen, setIsThisModalOpen] = useState(false);
  const onCloseCancel = () => {
    setIsThisModalOpen(false);
    onCancel();
  };

  return (
    <>
      <Button
        variant="primary"
        label={buttonLabel}
        disabled={disabled}
        onClick={() => setIsThisModalOpen(true)}
      />
      <Modal
        open={isThisModalOpen}
        onClose={onCloseCancel}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Card sx={{ minWidth: 275 }} className="change-type-of-analysis-modal">
          <CardContent>{confirmationMessage}</CardContent>
          <CardActions>
            <Button variant="primary" onClick={onConfirm} label={confirmationButtonLabel} />
            <Button
              className="dialog__primary-cancel"
              variant="clear"
              label="cancel"
              labelStyle={{ textTransform: 'initial', textDecoration: 'underline' }}
              onClick={onCloseCancel}
            />
          </CardActions>
        </Card>
      </Modal>
    </>
  );
}

export default ChangeTypeOfAnalysisModal;
