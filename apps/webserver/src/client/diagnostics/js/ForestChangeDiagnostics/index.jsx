import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import CircularProgress from '@mui/material/CircularProgress';
import Diagnostics from './Diagnostics';
import { diagnosticsStrings } from '../../../common/js/config';
import { useLocation } from 'react-router-dom';

// TODO: organize this function
function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const mapStateToProps = ({ infoBubbleCache, popover }) => ({ infoBubbleCache, popover });

function ForestChangeDiagnostics({ popover, infoBubbleCache }) {
  const query = useQuery();
  const [isLoading, setIsLoading] = useState(true);

  const [selectedList, setSelectedList] = useState({});
  const [spatialData, setSpatialData] = useState({});
  const [listLocationsIds, setListLocationsIds] = useState([]);
  const [listLevelAnalysis, setLstLevelAnalysis] = useState();
  const [processedListData, setProcessedListData] = useState();
  const [selectedLocationData, setSelectedLocationData] = useState();

  const listId = parseInt(query.get('listId'), 10);
  const locationId = parseInt(query.get('locationId'), 10) || null;
  const isGfwList = Boolean(query.get('gfw'));
  const isSharedList = Boolean(query.get('shared'));

  const diagnosticView = locationId ? 'LOCATION' : 'LIST';

  useEffect(() => {
    gtag('event', 'User accesses Forest Change Diagnostics View', {
      event_category: 'Forest Change Diagnostics',
    });
    fetch(`/diagnostics/${listId}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        locationId: locationId || '',
        isSharedList,
      }),
    })
      .then((res) => res.json())
      .then((diagnosticsData) => {
        const {
          selectedList,
          listLevelAnalysis,
          processedListData,
          spatialData,
          listLocationsIds,
        } = diagnosticsData;

        if (!selectedList || !processedListData) {
          throw new Error(diagnosticsStrings.listOrLocationNotFound);
        }

        setSelectedList(selectedList);
        setProcessedListData(processedListData);
        setSpatialData(spatialData);
        setListLocationsIds(listLocationsIds);
        setLstLevelAnalysis(listLevelAnalysis);
        setSelectedLocationData(processedListData[0]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        setSelectedList(null);
        console.warn(error);
      });
  }, [listId]);

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
      {!isLoading && !selectedList && !processedListData && (
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
      {!isLoading && selectedList && processedListData && (
        <Diagnostics
          selectedList={selectedList}
          listId={listId}
          isSharedList={isSharedList}
          isGfwList={isGfwList}
          diagnosticView={diagnosticView}
          listData={processedListData}
          listLevelAnalysis={listLevelAnalysis}
          spatialData={spatialData}
          selectedLocations={listLocationsIds}
          infoBubbleCache={infoBubbleCache}
          displayPopover={displayPopover}
          bubbleData={bubbleData}
          popoverLoading={popoverLoading}
          anchorEl={anchorEl}
          selectedLocationData={selectedLocationData}
        />
      )}
    </>
  );
}

export default connect(mapStateToProps)(ForestChangeDiagnostics);
