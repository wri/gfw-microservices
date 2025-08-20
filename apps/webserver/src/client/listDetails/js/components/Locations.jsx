import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Page from '../../../common/js/components/Page';
import { userAccessLevel, locationsPage } from '../../../common/js/config';
import ModalLoader from '../../../common/js/components/Loaders/ModalLoader';
import onListFromViewToList from '../utils/redirect';
import ListDetails from './lists/ListDetails';
import '../../../locations/css/locations.scss';

const pageOptions = {
  links: {
    logout: true,
  },
};

class Locations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      shareView: false,
    };
  }

  componentDidMount() {
    const { location, userLists, gfwLists, canopyModalVisible, userSharedLists } = this.props;

    let listToRedirect;

    const locationIdSearch = parseInt(new URLSearchParams(location.search).get('id'));
    const isGfwList = JSON.parse(new URLSearchParams(location.search).get('gfw'));
    const isSharedList = JSON.parse(new URLSearchParams(location.search).get('shared'));
    const shareView = new URLSearchParams(location.search).has('shareView');

    if (locationIdSearch) {
      const listToSearch = isGfwList ? gfwLists : isSharedList ? userSharedLists : userLists;
      listToRedirect = listToSearch?.find((listData) => listData.id === locationIdSearch);
    }

    if (listToRedirect) {
      onListFromViewToList(listToRedirect, canopyModalVisible);
    }

    if (shareView) {
      this.setState({ shareView: true });
    }

    this.setState({ isLoading: false });
  }

  componentWillUnmount() {
    if (this.unloadHistory) {
      this.unloadHistory();
    }
  }

  stopLoading = () => {
    this.setState({
      isLoading: false,
    });
  };

  showShareList = (show) => {
    if (show) {
      gtag('event', 'Back to list view link clicked', {
        event_category: 'Sharing',
        event_label: 'user clicked on the back to list view link from the sharing page',
      });
    } else {
      gtag('event', 'list table share', {
        event_category: 'Lists Click',
        event_label: 'user clicked share list',
      });
    }
    this.setState({
      shareView: show,
    });
  };

  render() {
    const { isLoading, shareView } = this.state;

    const {
      history,
      userLists,
      userInfo,
      usersList,
      userSharedLists,
      listView,
      addType,
      activeTemplate,
      userFolders,
      selectedLists,
      canopyModalVisible,
      filters,
      filterCount,
      listData,
      filteredData,
      selectedLocations,
      selectedAndVisibleLocations,
    } = this.props;

    const selectedList = selectedLists.length > 0 ? selectedLists[0] : null;
    let draftNonOwner = false;
    if (selectedList) {
      const userIsAdmin = userInfo.access_level_id === userAccessLevel.ADMIN;
      const userIsOwner = userInfo.id === selectedList.user_id;
      draftNonOwner = !userIsAdmin && !userIsOwner;
    }

    const filteredLocationData = listData
      .filter((listD) => filteredData.indexOf(listD.location_id) > -1)
      .map((loc) => {
        return {
          ...loc,
          draftNonOwner,
        };
      });

    return (
      <Page links={pageOptions.links} active="locations">
        <ModalLoader open={isLoading} />
        {!isLoading && selectedList ? (
          <ListDetails
            activeTemplate={activeTemplate}
            addType={addType}
            history={history}
            currentUser={userInfo}
            selectedLists={selectedLists}
            folders={userFolders}
            userLists={userLists} // Contains all lists that users have created
            listView={listView}
            canopyModalVisible={canopyModalVisible}
            filters={filters}
            filterCount={filterCount}
            listData={listData}
            filteredData={filteredData}
            filteredLocationData={filteredLocationData}
            selectedLocations={selectedLocations}
            selectedAndVisibleLocations={selectedAndVisibleLocations}
            stopLoading={this.stopLoading}
            usersList={usersList} // Contains all users
            userSharedLists={userSharedLists}
            shareView={shareView}
            showShareList={this.showShareList}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              width: '100vw',
              height: '100vh',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <h2>{locationsPage.lists.notFound}</h2>
          </div>
        )}
      </Page>
    );
  }
}

export default connect((state) => state)(withRouter(Locations));
