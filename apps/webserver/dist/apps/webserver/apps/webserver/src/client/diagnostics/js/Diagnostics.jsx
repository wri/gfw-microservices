import React from 'react';
import { withRouter } from 'react-router-dom';
import ForestChangeDiagnostics from './ForestChangeDiagnostics';
import AfiDiagnostics from './AfiDiagnostics';
import { analysisTypes } from '../../../config/env/analysisTypes.constants';

function Diagnostics({ location }) {
  const { FOREST_CHANGE_DIAGNOSTICS, DEFORESTATION_KPIS } = analysisTypes;

  const analysisTypeParam = new URLSearchParams(location.search).get('type');

  const analysisType = Object.values(analysisTypes).includes(analysisTypeParam)
    ? analysisTypeParam
    : FOREST_CHANGE_DIAGNOSTICS;

  const diagnosticsComponents = {
    [FOREST_CHANGE_DIAGNOSTICS]: <ForestChangeDiagnostics />,
    [DEFORESTATION_KPIS]: <AfiDiagnostics />,
  };

  return diagnosticsComponents[analysisType];
}

export default withRouter(Diagnostics);
