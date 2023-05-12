import React from 'react';
import PublicIcon from '@mui/icons-material/Public';
import VpnLockIcon from '@mui/icons-material/VpnLock';

const ShareListType = (props) => {
  return (
    <div>
      <div className="sharelist__details">
        <PublicIcon />
        <div>
          {props.title}
          <p className="sharelist__label">External</p>
        </div>
      </div>

      <h2 className="sharelist__title">Select type of sharing</h2>

      <div className="sharelist__options--collumns">
        <button
          className="sharelist__option sharelist__option--icon"
          onClick={() => props.handleResults() }>
            <VpnLockIcon />
            <div>
              Results
              <p className="sharelist__label">Share only the analysis results</p>
            </div>
        </button>
        <button
          className="sharelist__option sharelist__option--icon"
          onClick={() => props.handleList() }>
            <PublicIcon />
            <div>
              List
              <p className="sharelist__label">
                Share all the content of the list including country and other location data
              </p>
            </div>
        </button>
      </div>
    </div>
  );
}

export default ShareListType;
