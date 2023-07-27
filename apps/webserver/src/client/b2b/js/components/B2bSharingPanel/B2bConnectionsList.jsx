import React, { useState, useEffect } from 'react';

import { Container, Grid } from '@mui/material';
import B2BConnectionListTable from './B2BConnectionList/B2BConnectionListTable';
import NewConnectionButton from './NewConnectionButton';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import { getConnections } from './fetchB2b';
import './NewB2bConnectionModal/NewB2bConnectionModal.scss';

const B2bConnectionsList = () => {
  const [b2bConnections, setB2bConnections] = useState([]);
  const [filter, setfilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getConnections().then((res) => {
      setB2bConnections(res);
      setLoading(false);
    });
  }, []);

  const filterPerStatus = (status) => {
    if (status === filter) {
      getConnections().then((res) => {
        setB2bConnections(res);
      });
      setfilter('');
      return;
    }

    getConnections().then((res) => {
      setB2bConnections(res.filter((el) => el.status === status));
    });
    setB2bConnections(b2bConnections.filter((el) => el.status === status));
    setfilter(status);
  };

  const activeFilter = (status) => {
    return status === filter ? 'active' : '';
  };

  return (
    <Container>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <div>
          <button
            type="button"
            onClick={() => filterPerStatus('pending')}
            className={`tag ${activeFilter('pending')}`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => filterPerStatus('expired')}
            className={`tag ${activeFilter('expired')}`}
          >
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

      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
};

export default B2bConnectionsList;
