import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';

import Banner from '../../../../common/js/components/Banners/Banner';
import GDPRFooter from '../../../../common/js/components/GDPRFooter';
import UsageNearLimitBanner from '../../../../common/js/components/Banners/UsageNearLimitBanner';
import UsageReachedLimitBanner from '../../../../common/js/components/Banners/UsageReachedLimitBanner';
import { ExternalHelperResource, PillButton } from '../../../../components';
import ModalLoader from '../../../../common/js/components/Loaders/ModalLoader';
import { locationsPage } from '../../../../common/js/config';
import TranslatedText from '../../../../common/js/components/TranslatedText';
import IconButton from '../../../../common/js/components/IconButton';
import {
  changeView,
  resetList,
  selectFolder,
  updateFilteredData,
  updateFolders,
  updateListData,
  updateSelectedLocations,
} from '../../actions/locationActions';
import LocationList from './LocationList';
import ListsFilter from '../lists/ListsFilter';
import store from '../../store';
import '../../../css/locations.scss';
import GfwLocationList from './GfwLocationList';
import Folder from './Folder';
import IconPlus from '../../../../common/js/components/icon/IconPlus';
import IconMenuDots from '../../../../common/js/components/icon/IconMenuDots';
import NoResultsIllustration from '../../../images/illustration-locations-empty-state.svg';
import { getFolders } from './foldersApi';
import { numberWithCommas } from '../../utils/locationsTableUtils';
import AddLocationsPrompt from './components/AddLocationsPrompt';
import { normalizeShaledLists, nameContainsText } from '../../utils/shareList.utils';
import getCookie from '../../../../common/js/utils/getCookie';
import getAccountUsagePercentage from './getAccountUsagePercentage';
import { DATA_CY, ExternalLinks, ReusableText } from '../../../../utils/constants';
import RetirementBanner from '../../../../common/js/components/Banners/RetirementBanner';

class Landing extends Component {
  constructor(props) {
    super(props);

    this.state = {
      bannerContent: '',
      dialogOpen: false,
      dialogTitle: '',
      dialogContent: '',
      isLoading: false,
      userListFilterText: '',
      foldersLoaded: false,
      folderFeatureNew: false,
      isReachingAccountUsageLimit: false,
      isReachedAccountUsageLimit: false,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    const landingBannerContentCookie = getCookie('LandingBannerContent');

    if (landingBannerContentCookie) {
      this.setState({ bannerContent: landingBannerContentCookie });
      // unset cookie
      document.cookie = 'LandingBannerContent=; expires=0; path=/;';
    }

    this.loadFolders();

    getAccountUsagePercentage().then((accountUsagePercentageResponse) => {
      const { accountUsagePercentage } = accountUsagePercentageResponse;

      this.setState({
        isReachingAccountUsageLimit: accountUsagePercentage >= 90 && accountUsagePercentage !== 100,
        isReachedAccountUsageLimit: accountUsagePercentage == 100,
      });
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };

  uploadLocations = () => {
    store.dispatch(changeView('upload'));
    const { history } = this.props;
    history.push('/upload/step/1', { step: 1 });
  };

  addLocation = () => {
    const { history } = this.props;
    history.push('/add');
    store.dispatch(changeView('add'));
    gtag('event', 'Add a Location button clicked', {
      event_category: 'Landing Page Click',
      event_label: 'user clicked to add a single location',
    });
  };

  changeFolderView = (folder) => {
    const { history } = this.props;
    // reset list selections before setting new selection

    history.push('/folders');

    store.dispatch(resetList());
    store.dispatch(updateListData([]));
    store.dispatch(updateFilteredData([]));
    store.dispatch(updateSelectedLocations([]));
    store.dispatch(selectFolder(folder));
    store.dispatch(changeView('folders'));
  };

  changeList = ({ id }) => {
    window.location = `/list-details?id=${id}&gfw=true`;
  };

  showLoader = (isLoading) => {
    this.setState({
      isLoading,
    });
  };

  createGfwLocationsFromList = (list, i) => {
    return <GfwLocationList list={list} key={i} changeList={this.changeList} />;
  };

  createLocationsFromList = (list, i) => {
    const { history, userFolders, currentUser } = this.props;

    return (
      <LocationList
        showLoader={this.showLoader}
        history={history}
        folders={userFolders}
        list={list}
        locations={list.list_locations_count}
        key={i}
        showDialog={this.showDialog}
        showFailedDialog={this.showFailedDialog}
        currentUser={currentUser}
        onFolderChange={(msg) => {
          this.setState({ bannerContent: msg });
          this.loadFolders();
        }}
      />
    );
  };

  createFolder = (folder, i) => {
    return (
      <Folder
        folder={folder}
        key={i}
        onFolderChange={(msg) => {
          this.setState({ bannerContent: msg });
          this.loadFolders();
        }}
        changeFolderView={() => this.changeFolderView(folder)}
      />
    );
  };

  loadFolders() {
    const { userFolders, userLists } = this.props;

    getFolders().then((folders) => {
      if (!this._isMounted) {
        return;
      }
      store.dispatch(updateFolders(folders));
      this.setState({ foldersLoaded: true });

      if (
        userFolders.length === 0 &&
        userLists.length > 1 &&
        !document.cookie.includes('FolderFeatureSeen')
      ) {
        this.setState({ folderFeatureNew: true });
      }
    });
  }

  render() {
    const {
      isLoading,
      userListFilterText,
      bannerContent,
      dialogTitle,
      dialogOpen,
      dialogContent,
      foldersLoaded,
      folderFeatureNew,
      isReachingAccountUsageLimit,
      isReachedAccountUsageLimit,
    } = this.state;
    const { userLists, userSharedLists, userFolders, gfwLists, view, language } = this.props;

    let userListsFiltered;

    // show all user lists
    userListsFiltered = userLists
      .concat(normalizeShaledLists(userSharedLists))
      .filter((list) => nameContainsText(list.list_name, userListFilterText))
      .sort((l1, l2) => l1.list_name.localeCompare(l2.list_name))
      .map((list) => {
        const parent = userFolders.find((folder) =>
          folder.lists ? folder.lists.includes(list.id) : false
        );
        return Object.assign(list, { folder: parent });
      })
      .map(this.createLocationsFromList); // TODO: Show that some are pending!! -->

    const gfwListsMapped = gfwLists.map(this.createGfwLocationsFromList);

    const userFoldersFiltered = userFolders
      .filter((folder) => nameContainsText(folder.name, userListFilterText))
      .map(this.createFolder);

    const onChangeListsFilter = (value) => {
      if (value !== '' && userListFilterText === '') {
        gtag('event', 'User enters a search', {
          event_category: 'Landing Page Click',
        });
      }
      if (value === '' && userListFilterText !== '') {
        gtag('event', 'User clears search', {
          event_category: 'Landing Page Click',
        });
      }
      this.setState({ userListFilterText: value });
    };

    return (
      <div className={`${view === 'landing' ? '' : 'hidden'}`}>
        {isReachingAccountUsageLimit ? (
          <UsageNearLimitBanner
            onBannerClose={() =>
              this.setState((prevState) => ({
                isReachingAccountUsageLimit: !prevState.isReachingAccountUsageLimit,
              }))
            }
          />
        ) : null}

        {isReachedAccountUsageLimit && (
          <UsageReachedLimitBanner
            onBannerClose={() =>
              this.setState((prevState) => ({
                isReachedAccountUsageLimit: !prevState.isReachedAccountUsageLimit,
              }))
            }
          />
        )}
        {bannerContent && (
          <Banner
            className="landing-banner"
            intent="positive"
            onBannerClose={() => this.setState({ bannerContent: '' })}
          >
            <span>{bannerContent}</span>
          </Banner>
        )}

        <Dialog
          classes={{ paper: 'dialog-paper' }}
          open={dialogOpen}
          onClose={this.handleDialogClose}
        >
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogContent>
            <div
              className="dialog-content-email"
              dangerouslySetInnerHTML={{ __html: dialogContent }}
            />
          </DialogContent>
          <DialogActions>
            <PillButton variant="contained" onClick={this.handleDialogClose}>
              OK
            </PillButton>
          </DialogActions>
        </Dialog>

        <ModalLoader open={isLoading} />

        <section className="locations-body locations-body--new-upload flex-grid">
          <section className="col main-panel">
            <section className="gfw-lists">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">
                  <TranslatedText text="Welcome!" />
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <PillButton
                    variant="contained"
                    startIcon={<IconPlus height="10px" />}
                    data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW.ADD}
                    onClick={() => {
                      const { history } = this.props;
                      history.push('/upload-location');
                    }}
                  >
                    <TranslatedText text={locationsPage.landing.addLocations} />
                  </PillButton>
                  <ExternalHelperResource
                    text={<TranslatedText text="How to add your data" />}
                    url={ExternalLinks.UploadListHelpCenter}
                    color="info"
                  />
                </Box>
              </Box>

              <RetirementBanner dismissible />

              <Typography variant="h6" sx={{ mb: 1 }}>
                <TranslatedText text={locationsPage.landing.gfwLists} />
              </Typography>

              <div className="gfw-lists__inner">{gfwListsMapped}</div>
            </section>
            <section className="my-locations-section">
              <div className="my-locations__header">
                <Typography variant="h6">
                  <TranslatedText text={locationsPage.landing.myLocations} />
                </Typography>

                <ListsFilter value={userListFilterText} onChange={onChangeListsFilter} />
              </div>
              {(userFoldersFiltered.length > 0 || userListsFiltered.length > 0) &&
                userListFilterText.length > 0 && (
                  <p className="search-result-count">
                    {numberWithCommas(userListsFiltered.length + userFoldersFiltered.length)}{' '}
                    <TranslatedText
                      text={
                        userListsFiltered.length + userFoldersFiltered.length === 1
                          ? locationsPage.landing.resultItem
                          : locationsPage.landing.resultItems
                      }
                    />
                  </p>
                )}
              {/* FOLDERS */}
              {userListFilterText.length === 0 && userFoldersFiltered.length > 0 && (
                <h3 className="my-folders-title">
                  <TranslatedText text={locationsPage.landing.myFolders} />
                </h3>
              )}
              {userFoldersFiltered.length > 0 && (
                <ul className="my-folders-list">{userFoldersFiltered}</ul>
              )}

              {/* LISTS */}
              {foldersLoaded && !!folderFeatureNew && (
                <Banner
                  className="folder-feature-banner"
                  intent="new"
                  onBannerClose={() => {
                    if (document.cookie) {
                      document.cookie =
                        'FolderFeatureSeen=true; expires=Fri, 31 Dec 9999 23:59:59 GMT';
                      this.setState({ folderFeatureNew: false });
                    }
                  }}
                >
                  <>
                    <TranslatedText text="Organize lists into folders by clicking a" />{' '}
                    {
                      <IconButton
                        className="illustration-button"
                        style={{ borderRadius: '18px', cursor: 'text' }}
                        icon={<IconMenuDots />}
                        size="medium"
                        variant="menu"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      />
                    }{' '}
                    <TranslatedText text="button below." />
                  </>
                </Banner>
              )}
              {userListsFiltered.length > 0 && (
                <ul className="my-lists-list">{userListsFiltered}</ul>
              )}
              {userListsFiltered.length === 0 && userListFilterText.length === 0 && (
                <div className="no-lists">
                  <img
                    className="no-lists__illustration"
                    alt="no results"
                    src={NoResultsIllustration}
                  />
                  <AddLocationsPrompt key={language} languageCode={language} />
                  <PillButton
                    variant="contained"
                    size="small"
                    startIcon={<IconPlus height="10px" />}
                    sx={{ mx: 'auto' }}
                    onClick={() => {
                      const { history } = this.props;
                      history.push('/upload-location');
                    }}
                  >
                    <TranslatedText text={locationsPage.landing.addLocations} />
                  </PillButton>
                </div>
              )}
              {/* SEARCH: NO RESULTS */}
              {userFoldersFiltered.length === 0 &&
                userListsFiltered.length === 0 &&
                userListFilterText.length > 0 && (
                  <div className="no-search-results">
                    <p className="no-search-results__message">
                      <TranslatedText text={locationsPage.landing.noSearchResults} />
                    </p>
                    <PillButton
                      variant="contained"
                      color="info"
                      size="small"
                      onClick={() => this.setState({ userListFilterText: '' })}
                      sx={{ mx: 'auto', mt: 1 }}
                    >
                      <TranslatedText text={locationsPage.landing.clearSearch} />
                    </PillButton>
                  </div>
                )}
            </section>
          </section>
        </section>
        <GDPRFooter variant="app" />
      </div>
    );
  }
}

export default withRouter(Landing);
