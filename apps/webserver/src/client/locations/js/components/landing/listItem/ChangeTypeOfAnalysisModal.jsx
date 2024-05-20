import React, { useState, useEffect, useMemo } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Modal from '@mui/material/Modal';
import Button from '../../../../../common/js/components/Button';
import AnalysisTypesSelector from '../../../../../common/js/components/AnalysisTypesSelector';
import { requestGeoTrellisAnalyzeList } from '../../../utils/request.utils';
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
        Newly-added analyses will be processed immediatley. Existing analyses will remain unchanged.
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
}) {
  const intialAnalysisSelection = listAnalysesStatus.map(({ analysisId }) => analysisId);
  const [selectedAnalysis, setSelectedAnalysis] = useState(intialAnalysisSelection);
  const [isAddingAnalysis, setIsAddingAnalysis] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isAddingElements = selectedAnalysis.some(
      (item) => !intialAnalysisSelection.includes(item)
    );

    if (isAddingElements) {
      setIsAddingAnalysis(true);
    } else if (intialAnalysisSelection.length > selectedAnalysis.length) {
      setIsAddingAnalysis(false);
    }
  }, [selectedAnalysis]);

  const saveSelectedAnalysis = () => {
    return fetch(`/api/list/${listId}/selectedAnalyses`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisIds: selectedAnalysis }),
    });
  };

  const requestListForAnalysis = () => {
    const analysisTypesForRequest = selectedAnalysis.filter(
      (analysis) => !intialAnalysisSelection.includes(analysis)
    );

    return requestGeoTrellisAnalyzeList(
      {
        id: listId,
        list_name: listName,
      },
      true,
      analysisTypesForRequest.join()
    );
  };

  const finallyCompleteAnalysisTypesUpdate = () => {
    setIsLoading(false);
    setIsChangeTypeOfAnalysisModalOpen(false);
    // we don't have a way to reload the list of lists so we reload the page
    window.location.href = '/locations';
  };

  const updateSelectedAnalysis = () => {
    setIsLoading(true);

    const promises = [saveSelectedAnalysis()];

    if (isAddingAnalysis) {
      promises.push(requestListForAnalysis());
    }

    Promise.all(promises)
      .then((results) => {
        console.log(`updateSelectedAnalysis results`, results);
      })
      .catch(() => {
        console.warn(error);
        setIsLoading(false);
      })
      .finally(() => finallyCompleteAnalysisTypesUpdate());
  };

  const revertChanges = () => {
    setSelectedAnalysis(intialAnalysisSelection);
  };

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
            />
          </CardContent>
          <CardActions>
            {isLoading ? (
              <InlineLoader />
            ) : isAddingAnalysis ? (
              <ButtonWithConfirmationPrompt
                buttonLabel="Submit"
                confirmationMessage={<AddAnalysisTypeConfirmationMessage />}
                disabled={selectedAnalysis.every((analysis) =>
                  intialAnalysisSelection.includes(analysis)
                )}
                onConfirm={updateSelectedAnalysis}
                onCancel={revertChanges}
              />
            ) : (
              <Button
                variant="primary"
                disabled={selectedAnalysis.length === intialAnalysisSelection.length}
                onClick={updateSelectedAnalysis}
                label="Submit"
              />
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
