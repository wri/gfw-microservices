import { useState, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import Diagnostics from './Diagnostics';
import { diagnosticsStrings } from '../../../common/js/config';
import { useQuery } from '../../../common/js/hooks';
import getAnalysisAvailabilityMessage from '../common/getAnalysisAvailabilityMessage';
import { LoadingModal } from '../../../components';

const mapStateToProps = ({ infoBubbleCache, popover }) => ({ infoBubbleCache, popover });

function ForestChangeDiagnostics({ popover, infoBubbleCache }) {
  const query = useQuery();
  const [isLoading, setIsLoading] = useState(true);

  const [selectedList, setSelectedList] = useState({});
  const [spatialData, setSpatialData] = useState({});
  const [listLocationsIds, setListLocationsIds] = useState([]);
  const [listLevelAnalysis, setListLevelAnalysis] = useState();
  const [processedListData, setProcessedListData] = useState();
  const [selectedLocationData, setSelectedLocationData] = useState();
  const [isLegacyAnalysis, setIsLegacyAnalysis] = useState(false);

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
        isGfwList,
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
        setListLevelAnalysis(listLevelAnalysis);
        setSelectedLocationData(processedListData[0]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        setSelectedList({});
        console.warn(error);
      });
  }, [listId]);

  useEffect(() => {
    if (listLevelAnalysis != null) {
      const hasCountryArea = listLevelAnalysis[0]?.country_area !== null;
      setIsLegacyAnalysis(!hasCountryArea);
    }
  }, [listLevelAnalysis]);

  const { displayPopover, bubbleData, popoverLoading, anchorEl } = popover;

  const { DiagnosticsStatusMessage, isListBeingAnalyzed } = useMemo(() => {
    if (!selectedList?.list_status_id) {
      return { DiagnosticsStatusMessage: null, isListBeingAnalyzed: false };
    }

    const { list_status_id, listAnalysesStatus } = selectedList;

    return getAnalysisAvailabilityMessage(list_status_id, listAnalysesStatus, isLegacyAnalysis);
  }, [selectedList, isLegacyAnalysis]);

  return (
    <>
      <LoadingModal isLoading={isLoading} />
      {!isLoading && DiagnosticsStatusMessage}
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
      {!isLoading && selectedList && processedListData && !isListBeingAnalyzed && (
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
