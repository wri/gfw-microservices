import React, { useState } from 'react';
import { Container, Grid } from '@mui/material';
import './NewB2bConnectionModal/NewB2bConnectionModal.scss';
import B2BComingSoon from './B2BConnectionList/B2BComingSoon';
import B2BConnectionListTable from './B2BConnectionList/B2BConnectionListTable';
import NewConnectionButton from './NewConnectionButton';
import { b2bConnectionsMock } from './b2bConnectionsMock';

const B2bConnectionsList = () => {
  const [b2bConnections, setB2bConnections] = useState(b2bConnectionsMock);
  const [filter, setfilter] = useState('');

  const filterPerStatus = (status) => {
    if(status === filter) {
      setB2bConnections(b2bConnectionsMock);
      setfilter('')
      return;
    }
    setB2bConnections(b2bConnectionsMock.filter((el) => el.status === status));
    setfilter(status)
  };

  const activeFilter = (status) => {
    return status === filter ? 'active' : ''; 
  }

  const B2bConnectionsEnabled = false;
  return (
    <>
      { B2bConnectionsEnabled ? ( 
        <Container>
          <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <div>
              <button onClick={() => filterPerStatus('pending')} className={`tag ${activeFilter('pending')}`}>Pending</button>
              <button onClick={() => filterPerStatus('expired')} className={`tag ${activeFilter('expired')}`}>Expired</button>
              <button onClick={() => filterPerStatus('connected')} className={`tag ${activeFilter('connected')}`}>Connected</button>
            </div>
            <NewConnectionButton />
          </Grid>

          <B2BConnectionListTable rows={b2bConnections} />
        </Container>
      ) : (
        <B2BComingSoon />
      )}
    </>
  );
}

export default B2bConnectionsList;
