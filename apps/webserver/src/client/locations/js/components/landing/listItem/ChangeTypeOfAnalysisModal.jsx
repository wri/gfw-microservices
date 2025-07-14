import { useState, useEffect } from 'react';
import { Card, CardContent, CardActions, Modal } from '@mui/material';
import isEqual from 'lodash/isEqual';
import Button from '../../../../../common/js/components/Button';
import AnalysisTypesSelector from '../../../../../common/js/components/AnalysisTypesSelector';
import { requestGeoTrellisAnalyzeList } from '../../../utils/requestUtils';
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
  listName,
  setIsChangeTypeOfAnalysisModalOpen,
  isChangeTypeOfAnalysisModalOpen,
  listAnalysesStatus,
  commodity,
  isPalmOilBackwardComp,
}) {
  const initialAnalysisSelection = listAnalysesStatus.map(({ analysisId }) => analysisId);
  const [selectedAnalysis, setSelectedAnalysis] = useState(initialAnalysisSelection);
  const [isAddingAnalysis, setIsAddingAnalysis] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isAddingElements = selectedAnalysis.some(
      (item) => !initialAnalysisSelection.includes(item)
    );

    if (isAddingElements) {
      setIsAddingAnalysis(true);
    } else if (initialAnalysisSelection.length > selectedAnalysis.length) {
      setIsAddingAnalysis(false);
    }
  }, [selectedAnalysis]);

  const saveSelectedAnalysis = (saveAsDraft = false) => {
    return fetch(`/api/list/${listId}/selectedAnalyses`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisIds: selectedAnalysis, saveAsDraft }),
    });
  };

  const requestAnalysisForSelectedTypes = () => {
    // Filter out GHG analysis before sending to GeoTrellis
    const analysesForGeoTrellis = selectedAnalysis.filter((analysisId) => analysisId !== 'GHG');

    if (analysesForGeoTrellis.length === 0) {
      return Promise.resolve();
    }

    return requestGeoTrellisAnalyzeList(
      {
        id: listId,
        list_name: listName,
      },
      analysesForGeoTrellis.join(','),
      true
    );
  };

  const saveAsDraft = async () => {
    setIsLoading(true);
    await saveSelectedAnalysis(true);
    window.location.reload();
  };

  const submitSelectedAnalysis = () => {
    setIsLoading(true);

    const promises = [saveSelectedAnalysis()];

    if (isAddingAnalysis) {
      promises.push(requestAnalysisForSelectedTypes());
    }

    Promise.all(promises)
      .then((results) => {
        console.log(`submitSelectedAnalysis results`, results);
      })
      .catch((error) => {
        console.warn(error);
        setIsLoading(false);
      })
      .finally(() => {
        setIsLoading(false);
        setIsChangeTypeOfAnalysisModalOpen(false);
        // we don't have a way to reload the list of lists so we reload the page
        window.location.reload();
      });
  };

  const revertChanges = () => {
    setSelectedAnalysis(initialAnalysisSelection);
  };

  const isSelectionUnchanged = isEqual(selectedAnalysis, initialAnalysisSelection);

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
            <AnalysisTypesSelector
              selectedAnalyses={selectedAnalysis}
              setSelectedAnalyses={setSelectedAnalysis}
              commodity={commodity}
              isPalmOilBackwardComp={isPalmOilBackwardComp}
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
