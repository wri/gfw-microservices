import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Modal from '@mui/material/Modal';
import Button from '../../../../../common/js/components/Button';
import AnalysisTypesSelector from '../../../../../common/js/components/AnalysisTypesSelector';
import './ChangeTypeOfAnalysisModal.scss';

function ChangeTypeOfAnalysisModal({
  id,
  setIsChangeTypeOfAnalysisModalOpen,
  isChangeTypeOfAnalysisModalOpen,
}) {
  const [selectedAnalysis, setSelectedAnalysis] = useState([]);
  const updateSelectedAnalysis = () => {
    console.log({ id, selectedAnalysis });
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
          <AnalysisTypesSelector handleAnalyzesSelection={setSelectedAnalysis} />
          <br />
          <Button variant="primary" onClick={updateSelectedAnalysis} label="Submit" />
        </CardContent>
      </Card>
    </Modal>
  );
}

export default ChangeTypeOfAnalysisModal;
