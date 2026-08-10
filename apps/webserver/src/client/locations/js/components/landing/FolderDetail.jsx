import { Component } from 'react';

import store from '../../store';
import LocationList from './LocationList';
import IconFolder from '../../../../common/js/components/icon/IconFolder';
import { Link } from '../../../../components';
import ModalLoader from '../../../../common/js/components/Loaders/ModalLoader';
import ListsFilter from '../lists/ListsFilter';
import { locationsPage, folderDetailPage } from '../../../../common/js/config';
import Banner from '../../../../common/js/components/Banners/Banner';
import TranslatedText from '../../../../common/js/components/TranslatedText';

import { changeView, selectFolder } from '../../actions/locationActions';

import './FolderDetail.scss';
import { getFolders } from './foldersApi';

import Breadcrumbs from '../../../../common/js/components/Breadcrumbs';
import { numberWithCommas } from '../../utils/locationsTableUtils';

export default class FolderDetail extends Component {
  unloadHistory = undefined;

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      userListFilterText: '',
      bannerContent: '',
    };
  }

  componentDidMount() {
    this.unloadHistory = this.props.history.listen((location) => {
      const view = location.pathname.slice(1) ? location.pathname.slice(1) : 'landing';
      store.dispatch(changeView(view));
    });
  }

  changeToLocationView = () => {
    store.dispatch(changeView('landing'));
    const { history } = this.props;
    history.push('/');
  };

  showLoader = (isLoading) => {
    this.setState({
      isLoading: isLoading,
    });
  };

  createLocationsFromList = (list, i) => {
    return (
      <LocationList
        showLoader={this.showLoader}
        history={this.props.history}
        folders={this.props.folders}
        list={list}
        locations={list.list_locations_count}
        key={i}
        showDialog={this.showDialog}
        showFailedDialog={this.showFailedDialog}
        currentUser={this.props.currentUser}
        onFolderChange={(msg) => {
          this.setState({ bannerContent: msg });
          getFolders().then((folders) => {
            store.dispatch(
              selectFolder(folders.find((f) => f.id === this.props.selectedFolder.id))
            );
          });
        }}
      />
    );
  };

  render() {
    const { selectedFolder, lists } = this.props;

    const folderLists = lists.filter((list) =>
      selectedFolder.lists ? selectedFolder.lists.includes(list.id) : false
    );

    const locationCount = folderLists
      .map((list) => list.list_locations_count)
      .reduce((l1, l2) => l1 + l2, 0);

    const strings = folderDetailPage;

    const filteredFolderLists = this.state.userListFilterText
      ? folderLists.filter((l) =>
          l.list_name.toLowerCase().includes(this.state.userListFilterText.toLowerCase())
        )
      : folderLists;

    return (
      <div className="folder-detail">
        {this.state.bannerContent && (
          <Banner
            className="landing-banner"
            intent="positive"
            onBannerClose={() => this.setState({ bannerContent: '' })}
          >
            <span>{this.state.bannerContent}</span>
          </Banner>
        )}
        <ModalLoader open={this.state.isLoading} />

        <Breadcrumbs>
          <Link component="button" type="button" onClick={this.changeToLocationView}>
            {strings.breadcrumbLocation}
          </Link>
          <span>{selectedFolder.name}</span>
        </Breadcrumbs>
        <section>
          <div className="folder-detail__content">
            <div className="folder-detail__header">
              <div className="folder-detail__header-column">
                <h1 className="folder-detail__title">
                  <IconFolder className="folder-detail__icon" />
                  {selectedFolder.name}
                </h1>
                <div className="folder-detail__counts">
                  {numberWithCommas(folderLists ? folderLists.length : 0) +
                    ' ' +
                    (folderLists && folderLists.length === 1
                      ? strings.folderItem
                      : strings.folderItems
                    ).toLowerCase()}
                  <span className="folder-detail__counts-divider">•</span>
                  {numberWithCommas(locationCount ? locationCount : 0) +
                    ' ' +
                    (locationCount && locationCount === 1
                      ? strings.folderLocation
                      : strings.folderLocations
                    ).toLowerCase()}
                </div>
              </div>
              <div className="folder-detail__header-column folder-detail__search-container">
                <ListsFilter
                  value={this.state.userListFilterText}
                  onChange={(value) => this.setState({ userListFilterText: value })}
                />
              </div>
            </div>
            {/* LISTS */}
            <div className="folder-detail__location_lists">
              <ul className="my-lists-list">
                {filteredFolderLists.map(this.createLocationsFromList)}
              </ul>
            </div>
            {/* SEARCH: NO RESULTS */}
            {filteredFolderLists.length === 0 && folderLists.length !== 0 && (
              <div className="no-search-results">
                <p className="no-search-results__message">
                  <TranslatedText text={locationsPage.landing.noSearchResults} />
                </p>
                <Link
                  className="no-search-results__clear"
                  onClick={() => this.setState({ userListFilterText: '' })}
                  component="button"
                  type="button"
                >
                  <TranslatedText text={locationsPage.landing.clearSearch} />
                </Link>
              </div>
            )}
            {/* NO RESULTS, NO SEARCH */}
            {folderLists.length === 0 && (
              <div className="no-search-results">
                <p className="no-search-results__message">{folderDetailPage.noLists}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }
}
