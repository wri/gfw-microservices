import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import { viewDiagnostic } from './viewDiagnostic';
import Diagnostics from './Diagnostics';
import { diagnosticsStrings } from '../../../common/js/config';

const mapStateToProps = ({ infoBubbleCache, popover }) => ({ infoBubbleCache, popover });

function ForestChangeDiagnostics({ location, popover, infoBubbleCache }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({});
  const [spatialData, setSpatialData] = useState();

  const [locationIds, setLocationIds] = useState([]);

  const listId = parseInt(new URLSearchParams(location.search).get('listId'), 10);
  const locationId = parseInt(new URLSearchParams(location.search).get('locationId'), 10) || null;
  const selectedLocation = locationId ? [locationId] : [];
  const isGfwList = JSON.parse(new URLSearchParams(location.search).get('gfw'));
  const isSharedList = JSON.parse(new URLSearchParams(location.search).get('shared'));
  const diagnosticView = locationId ? 'LOCATION' : 'LIST';

  useEffect(() => {
    fetch(`/diagnosticsData`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({ listId, locationId, isGfwList, isSharedList }),
    })
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        const { selectedLists } = data;
        if (!selectedLists) {
          throw new Error(diagnosticsStrings.listOrLocationNotFound);
        }
        return viewDiagnostic(selectedLists[0], selectedLocation); // we should move this to the diagnosticsData endpoint
      })
      .then(([spatialData, locationIDs]) => {
        setSpatialData(spatialData);
        setLocationIds(locationIDs);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        console.warn(error);
      });
  }, []);

  const { selectedLists, listLevelAnalysis, processedListData, selectedLocationData } = data;
  const { displayPopover, bubbleData, popoverLoading, anchorEl } = popover;

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
      {!isLoading && !selectedLists && (
        <div
          style={{
            display: 'flex',
            width: '100vw',
            height: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h2>{diagnosticsStrings.listOrLocationNotFound}</h2>
        </div>
      )}
      {!isLoading && selectedLists && (
        <>
          <Diagnostics
            listId={listId}
            isSharedList={isSharedList}
            isGfwList={isGfwList}
            diagnosticView={diagnosticView}
            selectedLists={selectedLists}
            listData={processedListData}
            listLevelAnalysis={listLevelAnalysis}
            spatialData={spatialData}
            selectedLocations={locationIds}
            infoBubbleCache={infoBubbleCache}
            displayPopover={displayPopover}
            bubbleData={bubbleData}
            popoverLoading={popoverLoading}
            anchorEl={anchorEl}
            selectedLocationData={selectedLocationData}
          />
        </>
      )}
    </>
  );
}

export default withRouter(connect(mapStateToProps)(ForestChangeDiagnostics));
