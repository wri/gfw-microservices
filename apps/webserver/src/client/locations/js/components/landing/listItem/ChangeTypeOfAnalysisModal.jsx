import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Modal from '@mui/material/Modal';
import Button from '../../../../../common/js/components/Button';
import AnalysisTypesSelector from '../../../../../common/js/components/AnalysisTypesSelector';
import { requestGeoTrellisAnalyzeList } from '../../../utils/request.utils';
import InlineLoader from '../../../../../common/js/components/Loaders/InlineLoader';
import { analysisTypes } from '../../../../../../config/env/analysisTypes.constants';
import './ChangeTypeOfAnalysisModal.scss';

const DialogSubmitSuccessContent = () => {
  return (
    <p>
      You've successfully added new analyses to your list. Your list will be in draft state until
      you re-run analysis to account for your changes. Note that running analysis counts towards
      your account usage limits. See more information{' '}
      <a href="/about?section=Fees" target="_blank" style={{ color: '#97bd3d' }}>
        here
      </a>
      .
    </p>
  );
};

function ChangeTypeOfAnalysisModal({
  listId,
  listName,
  setIsChangeTypeOfAnalysisModalOpen,
  isChangeTypeOfAnalysisModalOpen,
  listAnalysesStatus,
}) {
  const getSelectedAnalysesIds = () => {
    return listAnalysesStatus.map(({ analysisId }) => analysisId);
  };

  const [selectedAnalysis, setSelectedAnalysis] = useState([]);
  const [prevSelectedAnalysis, setPrevSelectedAnalysis] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogSuccessOpen, setIsDialogSuccessOpen] = useState(false);

  // if there is no listId, the analyses selection is for the creation of a new list
  const isUpdatingForExistingList = !!listId;

  useEffect(() => {
    if (isUpdatingForExistingList) {
      const initialSelection = getSelectedAnalysesIds();
      setSelectedAnalysis(initialSelection);
      setPrevSelectedAnalysis(initialSelection);
    }
  }, [listAnalysesStatus, listId]);

  const updateSelectedAnalysis = () => {
    setIsLoading(true);

    const isAddingAnalysis = selectedAnalysis.some(
      (analysis) => !prevSelectedAnalysis.includes(analysis)
    );

    fetch(`/api/list/${listId}/selectedAnalyses`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisIds: selectedAnalysis }),
    })
      .then(() => {
        // Check if any analysis was added (not removed)
        if (isUpdatingForExistingList && isAddingAnalysis) {
          const newlyAddedAnalysisTypes = selectedAnalysis.filter(
            (analysis) => !prevSelectedAnalysis.includes(analysis)
          );
          return requestGeoTrellisAnalyzeList(
            {
              id: listId,
              list_name: listName,
            },
            true,
            newlyAddedAnalysisTypes.join()
          );
        }
        return Promise.resolve(false);
      })
      .then((isAddingAnalysisForList) => {
        if (selectedAnalysis.includes(analysisTypes.DEFORESTATION_KPIS)) {
          gtag('event', 'User changes the selected analyses from landing page', {
            event_category: 'Deforestation Reporting KPIs',
          });
        }
        if (isAddingAnalysisForList) {
          setIsDialogSuccessOpen(true);
        }
      })
      .catch((error) => {
        console.warn(error);
        setIsLoading(false);
      });
  };

  const handleDialogClose = () => {
    setIsChangeTypeOfAnalysisModalOpen(false);
    // we don't have a way to reload the list of lists so we reload the page
    window.location.href = '/locations';
  };

  const analysisTypeSelectionForm = (
    <>
      <AnalysisTypesSelector
        selectedAnalyses={selectedAnalysis}
        setSelectedAnalyses={setSelectedAnalysis}
      />
      <br />
      {isUpdatingForExistingList && isLoading && <InlineLoader />}
      {isUpdatingForExistingList && !isLoading && (
        <Button
          variant="primary"
          disabled={!selectedAnalysis.length}
          onClick={updateSelectedAnalysis}
          label="Submit"
        />
      )}
    </>
  );

  const analisysRequestSuccess = (
    <>
      <DialogSubmitSuccessContent />
      <Button
        variant="primary"
        disabled={!selectedAnalysis.length}
        onClick={handleDialogClose}
        label={`OK`}
      />
    </>
  );

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
            {isDialogSuccessOpen ? analisysRequestSuccess : analysisTypeSelectionForm}
          </CardContent>
        </Card>
      </Modal>
    </>
  );
}

export default ChangeTypeOfAnalysisModal;
