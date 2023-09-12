import React from 'react';
import { withRouter } from 'react-router-dom';
import ForestChangeDiagnostics from './ForestChangeDiagnostics';
import EudrDiagnostics from './EudrDiagnostics';
import { analysisTypes } from '../../../config/env/analysisTypes.constants';

function Diagnostics({ location }) {
  const { FOREST_CHANGE_DIAGNOSTICS, DEFORESTATION_KPIS } = analysisTypes;

  const analysisType =
    new URLSearchParams(location.search).get('type') ?? FOREST_CHANGE_DIAGNOSTICS;

  const diagnosticsComponents = {
    [FOREST_CHANGE_DIAGNOSTICS]: <ForestChangeDiagnostics />,
    [DEFORESTATION_KPIS]: <EudrDiagnostics />,
  };

  return diagnosticsComponents[analysisType];
}

export default withRouter(Diagnostics);
