import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Modal from '@mui/material/Modal';
import Button from '../../../../../common/js/components/Button';
import AnalysisTypesSelector from '../../../../../common/js/components/AnalysisTypesSelector';
import { listStatus } from '../../../../../../config/env/listStatuses.constants';
import './ChangeTypeOfAnalysisModal.scss';

function ChangeTypeOfAnalysisModal({
  listId,
  setIsChangeTypeOfAnalysisModalOpen,
  isChangeTypeOfAnalysisModalOpen,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState([]);

  // if there is no listId, the analyses selection is for the creation of a new list
  const updatingAnalysesSelectionForExistingList = !!listId;

  useEffect(() => {
    if (updatingAnalysesSelectionForExistingList) {
      fetch(`/api/list/${listId}/selectedAnalyses`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((selectedAnalyses) => {
          const selectedAnalysesIds = selectedAnalyses
            .filter(({ Status }) => Status === listStatus.Active)
            .map(({ AnalysisID }) => AnalysisID);
          setSelectedAnalysis(selectedAnalysesIds);
          setIsLoading(false);
        })
        .catch((error) => {
          setIsLoading(false);
          console.warn(error);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const updateSelectedAnalysis = () => {
    fetch(`/api/list/${listId}/selectedAnalyses`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisIds: selectedAnalysis }),
    }).then((response) => {
      setIsChangeTypeOfAnalysisModalOpen(false);
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
          {!isLoading && (
            <AnalysisTypesSelector
              selectedAnalyses={selectedAnalysis}
              setSelectedAnalyses={setSelectedAnalysis}
            />
          )}
          <br />
          {updatingAnalysesSelectionForExistingList && (
            <Button variant="primary" onClick={updateSelectedAnalysis} label="Submit" />
          )}
        </CardContent>
      </Card>
    </Modal>
  );
}

export default ChangeTypeOfAnalysisModal;
