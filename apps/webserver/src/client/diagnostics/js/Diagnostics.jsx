import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import ForestChangeDiagnostics from './ForestChangeDiagnostics';
import EudrDiagnostics from './EudrDiagnostics';
import { analysisTypes } from '../../../config/env/analysisTypes.constants';

function Diagnostics({ location }) {
  const { FOREST_CHANGE_DIAGNOSTICS, DEFORESTATION_KPIS } = analysisTypes;

  const analysisType =
    new URLSearchParams(location.search).get('type') ?? FOREST_CHANGE_DIAGNOSTICS;

  // *--------------------- temporary while endpoint is created

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({});

  const listId = parseInt(new URLSearchParams(location.search).get('listId'), 10);
  const isSharedList = JSON.parse(new URLSearchParams(location.search).get('shared'));

  useEffect(() => {
    fetch(`/diagnosticsData`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({ listId, isSharedList }),
    })
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        console.warn(error);
      });
  }, []);

  const { selectedLists } = data;
  // *--------------------- temporary while endpoint is created

  const renderDiagnostics = () => {
    switch (analysisType) {
      case FOREST_CHANGE_DIAGNOSTICS:
        return <ForestChangeDiagnostics />;
      case DEFORESTATION_KPIS:
        return <EudrDiagnostics selectedList={selectedLists[0]} />;
      default:
        return <ForestChangeDiagnostics />;
    }
  };

  return (
    <>
      {isLoading && (
        <div
          style={{
            display: 'flex',
            width: '100vw',
            height: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress color="success" />
        </div>
      )}
      {!isLoading && renderDiagnostics()}
    </>
  );
}

export default withRouter(Diagnostics);
