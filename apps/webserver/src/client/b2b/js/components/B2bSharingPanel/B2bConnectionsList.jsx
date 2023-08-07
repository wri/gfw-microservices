import React, { useState, useEffect } from 'react';

import { Container, Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import B2BConnectionListTable from './B2BConnectionList/B2BConnectionListTable';
import NewConnectionButton from './NewConnectionButton';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import { getConnections } from './fetchB2b';
import B2BImageCard from './B2BConnectionList/B2BImageCard';
import './NewB2bConnectionModal/NewB2bConnectionModal.scss';
import './B2BConnectionList/B2BConnectionList.scss';

const B2bConnectionsList = () => {
  const [b2bSelectedConnections, setB2bSelectedConnections] = useState([]);
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
      <div className="table__filter">
        {b2bSelectedConnections.length > 0 ? (
          <div>
            <button className="table__action-button table__action-button--red">Reject all</button>
            <button className="table__action-button">Accept all</button>
          </div>
        ) : (
          <>
            <a className="table__filter__link" href="/locations">
              <ArrowBackIcon />
              B2B connections
            </a>
          
            { b2bConnections.length > 0 && (
              <>
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
              </>
            )}
          </>
        )}
      </div>
      {b2bConnections.length > 0 ? (
        <B2BConnectionListTable rows={b2bConnections} handleSelectRow={setB2bSelectedConnections} />
      ) : (
        <B2BImageCard title="Connect">
          <p style={{ width: '500px', margin: '0 auto 20px' }}>
            B2B connections allow you to safely share information
            with other organizations using GFW Pro.
          </p>
          <NewConnectionButton />
        </B2BImageCard>
      )}

      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
};

export default B2bConnectionsList;
