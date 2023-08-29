import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Modal from '@mui/material/Modal';
import AnalysisTypesSelector from '../../../../../common/js/components/AnalysisTypesSelector';
import './ChangeTypeOfAnalysisModal.scss';

function ChangeTypeOfAnalysisModal({
  setIsChangeTypeOfAnalysisModalOpen,
  isChangeTypeOfAnalysisModalOpen,
}) {
  return (
    <Modal
      open={isChangeTypeOfAnalysisModalOpen}
      onClose={() => setIsChangeTypeOfAnalysisModalOpen(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Card sx={{ minWidth: 275 }} className="change-type-of-analysis-modal">
        <CardContent>
          <AnalysisTypesSelector />
        </CardContent>
      </Card>
    </Modal>
  );
}

export default ChangeTypeOfAnalysisModal;
