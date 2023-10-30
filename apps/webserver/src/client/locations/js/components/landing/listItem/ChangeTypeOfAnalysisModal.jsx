import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Modal from '@mui/material/Modal';
import Button from '../../../../../common/js/components/Button';
import AnalysisTypesSelector from '../../../../../common/js/components/AnalysisTypesSelector';
import { requestGeoTrellisAnalyzeList } from '../../../utils/request.utils';
import InlineLoader from '../../../../../common/js/components/Loaders/InlineLoader';
import { listStatus } from '../../../../../../config/env/listStatuses.constants';
import { analysisTypes } from '../../../../../../config/env/analysisTypes.constants';
import './ChangeTypeOfAnalysisModal.scss';

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

  const [selectedAnalysis, setSelectedAnalysis] = useState(getSelectedAnalysesIds());
  const [isLoading, setIsLoading] = useState(false);
  // if there is no listId, the analyses selection is for the creation of a new list
  const updatingAnalysesSelectionForExistingList = !!listId;

  useEffect(() => {
    if (updatingAnalysesSelectionForExistingList) {
      setSelectedAnalysis(getSelectedAnalysesIds());
    }
  }, [listAnalysesStatus, listId]);

  const updateSelectedAnalysis = () => {
    setIsLoading(true);
    fetch(`/api/list/${listId}/selectedAnalyses`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisIds: selectedAnalysis }),
    })
      .then(() => {
        return requestGeoTrellisAnalyzeList({ id: listId, list_name: listName }, true);
      })
      .then(() => {
        if (selectedAnalysis.includes(analysisTypes.DEFORESTATION_KPIS)) {
          gtag('event', 'User changes the selected analyses from landing page', {
            event_category: 'Deforestation Reporting KPIs',
          });
        }
      })
      .catch((error) => {
        console.warn(error);
        setIsLoading(false);
      })
      .finally(() => {
        setIsChangeTypeOfAnalysisModalOpen(false);
        // we don't have a way to reload the list of lists so we reload the page
        window.location.href = '/locations';
      });
  };

  return (
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
          <br />

          {updatingAnalysesSelectionForExistingList && isLoading && <InlineLoader />}
          {updatingAnalysesSelectionForExistingList && !isLoading && (
            <Button
              variant="primary"
              disabled={!selectedAnalysis.length}
              onClick={updateSelectedAnalysis}
              label="Submit"
            />
          )}
        </CardContent>
      </Card>
    </Modal>
  );
}

export default ChangeTypeOfAnalysisModal;
