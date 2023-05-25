import React, { useState, useEffect } from 'react';

import { Container, Grid } from '@mui/material';
import B2BConnectionListTable from './B2BConnectionList/B2BConnectionListTable';
import NewConnectionButton from './NewConnectionButton';
import ConnectionDetailsButton from './ConnectionDetailsButton';
import { b2bConnectionsMock } from './b2bConnectionsMock';

import { getConnections } from './fetchB2b';
import './NewB2bConnectionModal/NewB2bConnectionModal.scss';


const B2bConnectionsList = () => {
  const [b2bConnections, setB2bConnections] = useState([]);
  const [filter, setfilter] = useState('');


  useEffect(() => {
    getConnections().then((res) => {
      setB2bConnections(res);
    });
  });

  const filterPerStatus = (status) => {
    if (status === filter) {
      setB2bConnections(b2bConnectionsMock);
      setfilter('');
      return;
    }
    setB2bConnections(b2bConnectionsMock.filter((el) => el.status === status));
    setfilter(status);

  };

  const activeFilter = (status) => {
    return status === filter ? 'active' : '';
  };

  return (
    <Container>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <div>

          <button type="button" onClick={() => filterPerStatus('pending')} className={`tag ${activeFilter('pending')}`}>
            Pending
          </button>
          <button type="button" onClick={() => filterPerStatus('expired')} className={`tag ${activeFilter('expired')}`}>
            Expired
          </button>
          <button
            type="button"

            onClick={() => filterPerStatus('connected')}
            className={`tag ${activeFilter('connected')}`}
          >
            Connected
          </button>
        </div>
        <NewConnectionButton />
      </Grid>
      {b2bConnections && <B2BConnectionListTable rows={b2bConnections} />}
      <ConnectionDetailsButton
        connectionData={{
          organizationName: 'Farm Inc',
          status: 'pending',
          name: 'John Doe',
          email: 'john@gmail.com',
        }}
      />
    </Container>
  );
};

export default B2bConnectionsList;
