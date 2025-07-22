import { Component } from 'react';
import { Dialog } from 'material-ui';
import {
  Alert,
  AlertTitle,
  Box,
  IconButton as IconButtonMui,
  Typography,
  Popover,
} from '@mui/material';
import { Campaign, Close, Info } from '@mui/icons-material';
import { withRouter } from 'react-router-dom';
import Banner from '../../../../common/js/components/Banners/Banner';
import UsageNearLimitBanner from '../../../../common/js/components/Banners/UsageNearLimitBanner';
import UsageReachedLimitBanner from '../../../../common/js/components/Banners/UsageReachedLimitBanner';
import Button from '../../../../common/js/components/Button';
import { ExternalHelperResource, PillButton } from '../../../../components';
import LinkButton from '../../../../common/js/components/LinkButton';
import ModalLoader from '../../../../common/js/components/Loaders/ModalLoader';
import { locationsPage, userAccessLevel } from '../../../../common/js/config';
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
import AddLocationChooser, { CHOICES } from './AddLocationChooser';
import GfwLocationList from './GfwLocationList';
import Folder from './Folder';
import IconPlus from '../../../../common/js/components/icon/IconPlus';
import IconMenuDots from '../../../../common/js/components/icon/IconMenuDots';
import NoResultsIllustration from '../../../images/illustration-locations-empty-state.svg';
import { getFolders } from './foldersApi';
import { numberWithCommas } from '../../utils/locationsTableUtils';
import AddLocationsPrompt from './components/AddLocationsPrompt';
import { normalizeShaledLists, nameContainsText } from '../../utils/shareList.utils';
import MyListsTabs from './MyListsTabs';
import { getMySharedLists, getListsSharedWithMe } from './getSharedLists';
import {
  MY_LISTS,
  MY_SHARED_LISTS,
  LISTS_SHARED_WITH_ME,
} from './MyListsTabs/MyListsTabs.constants';
import getCookie from '../../../../common/js/utils/getCookie';
import getAccountUsagePercentage from './getAccountUsagePercentage';
import featureFlags from '../../../../../utils/general.utils';
import { DATA_CY, ExternalLinks, ReusedTexts } from '../../../../utils/constants';

const EUDR_BANNER_KEY = 'GFW-is-landing-eudr-banner-dismissed';
class Landing extends Component {
  constructor(props) {
    super(props);

    const isEudrBannerDismissed = !!localStorage.getItem(EUDR_BANNER_KEY);

    this.state = {
      addLocationDialogOpen: false,
      bannerContent: '',
      dialogOpen: false,
      dialogTitle: '',
      dialogContent: '',
      isLoading: false,
      userListFilterText: '',
      foldersLoaded: false,
      folderFeatureNew: false,
      selectedTab: '',
      mySharedLists: [],
      listsSharedWithMe: [],
      isReachingAccountUsageLimit: false,
      isReachedAccountUsageLimit: false,
      isEudrBannerDismissed,
      anchorEl: null,
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
    if (this.props.B2BsharedListEnabled) {
      // fetch endpoints to get "my shared lists" and "lists shared with me"
      getMySharedLists().then((mySharedLists) => {
        this.setState({ mySharedLists });
      });

      getListsSharedWithMe().then((listsSharedWithMe) => {
        this.setState({ listsSharedWithMe });
      });
    }

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

  onAddLocationsChooserChoice = (choice) => {
    if (choice === CHOICES.SINGLE) {
      this.addLocation();
    } else if (choice === CHOICES.MULTIPLE) {
      this.uploadLocations();
    } else {
      console.error('Invalid choice chosen for AddLocationsChooser:', choice);
      this.setState({ addLocationDialogOpen: false });
    }
  };

  handlePopoverOpen = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handlePopoverClose = () => {
    this.setState({ anchorEl: null });
  };

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
    const isAListSharedWithMe = this.state.selectedTab === LISTS_SHARED_WITH_ME;

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
        B2BsharedListEnabled={this.props.B2BsharedListEnabled}
        onFolderChange={(msg) => {
          this.setState({ bannerContent: msg });
          this.loadFolders();
        }}
        isAListSharedWithMe={isAListSharedWithMe}
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
      addLocationDialogOpen,
      foldersLoaded,
      folderFeatureNew,
      selectedTab,
      mySharedLists,
      listsSharedWithMe,
      isReachingAccountUsageLimit,
      isReachedAccountUsageLimit,
    } = this.state;
    const {
      userLists,
      userSharedLists,
      userFolders,
      gfwLists,
      view,
      currentUser,
      language,
      B2BsharedListEnabled,
    } = this.props;

    const isPopoverOpen = !!this.state.anchorEl;

    const { isUploadListUiAvailable } = featureFlags;

    let userListsFiltered;

    if (!selectedTab || selectedTab === MY_LISTS) {
      // show My Lists if no tab is selected or if selected tab is My Lists
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
    } else if (selectedTab === MY_SHARED_LISTS) {
      userListsFiltered = mySharedLists.map(this.createLocationsFromList);
    } else if (selectedTab === LISTS_SHARED_WITH_ME) {
      userListsFiltered = listsSharedWithMe.map(this.createLocationsFromList);
    }

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

    const onListsTabSelected = (newSelectedTab) => {
      this.setState({ selectedTab: newSelectedTab });
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
          paperClassName="dialog-paper"
          title={dialogTitle}
          actions={[<Button variant="primary" label="OK" onClick={this.handleDialogClose} />]}
          modal={false}
          open={dialogOpen}
          onRequestClose={this.handleDialogClose}
        >
          <div
            className="dialog-content-email"
            dangerouslySetInnerHTML={{ __html: dialogContent }}
          />
        </Dialog>

        <Dialog
          modal
          open={addLocationDialogOpen}
          contentStyle={{ width: '60%', maxWidth: '1200px', transform: 'none' }}
        >
          <AddLocationChooser
            onCancel={() => this.setState({ addLocationDialogOpen: false })}
            onChoice={this.onAddLocationsChooserChoice}
            userLists={userLists}
          />
        </Dialog>

        <ModalLoader open={isLoading} />

        <section
          className={`locations-body ${
            isUploadListUiAvailable && 'locations-body--new-upload'
          } flex-grid`}
        >
          {!isUploadListUiAvailable && (
            <aside className="col side-panel">
              {currentUser.access_level_id !== userAccessLevel.VIEWER && (
                <>
                  <Button
                    className="side-panel__button"
                    label={locationsPage.landing.addLocations}
                    icon={<IconPlus height="10px" />}
                    onClick={() => this.setState({ addLocationDialogOpen: true })}
                    fullWidth
                    variant="primary"
                  />
                </>
              )}
            </aside>
          )}
          <section className="col main-panel">
            <section className="gfw-lists">
              {isUploadListUiAvailable && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h5">Welcome!</Typography>
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
                      Add locations
                    </PillButton>
                    <ExternalHelperResource
                      text="How to add your data"
                      url={ExternalLinks.UploadListHelpCenter}
                      color="info"
                    />
                  </Box>
                </Box>
              )}

              {!this.state.isEudrBannerDismissed && (
                <Alert
                  severity="info"
                  iconMapping={{
                    info: <Campaign />,
                  }}
                  action={
                    <IconButtonMui
                      onClick={() => {
                        localStorage.setItem(EUDR_BANNER_KEY, 1);
                        this.setState({ isEudrBannerDismissed: true });
                      }}
                      disableRipple
                    >
                      <Close sx={{ color: (theme) => theme.palette.text.primary }} />
                    </IconButtonMui>
                  }
                  sx={{
                    borderRadius: 1,
                    mb: 2,
                    border: (theme) => `1px solid ${theme.palette.secondary[300]}`,
                    backgroundColor: (theme) => theme.palette.secondary[100],
                    color: (theme) => theme.palette.secondary[900],
                    '& svg': {
                      color: (theme) => theme.palette.secondary[700],
                    },
                  }}
                >
                  <AlertTitle sx={{ display: 'flex' }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      New: Looking for EUDR-related analyses?
                    </Typography>
                    <IconButtonMui
                      onClick={this.handlePopoverOpen}
                      sx={{ p: 0, ml: 0.75 }}
                      aria-label="open popover"
                    >
                      <Info fontSize="small" />
                    </IconButtonMui>
                    <Popover
                      id={isPopoverOpen ? 'popover' : undefined}
                      open={isPopoverOpen}
                      anchorEl={this.state.anchorEl}
                      onClose={this.handlePopoverClose}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      slotProps={{
                        paper: {
                          sx: {
                            ml: 1,
                          },
                        },
                      }}
                    >
                      <Box sx={{ width: (theme) => theme.spacing(40), p: 1 }}>
                        <Typography variant="caption">{ReusedTexts.EudrLegalDisclaimer}</Typography>
                      </Box>
                    </Popover>
                  </AlertTitle>
                  <Typography variant="body1">
                    Enable the Post-2020 Risk Assessment when uploading new locations, or add it to
                    an existing list via Change Analyses.
                  </Typography>
                </Alert>
              )}

              {isUploadListUiAvailable ? (
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {locationsPage.landing.gfwLists}
                </Typography>
              ) : (
                <h2 className="gfw-lists__title">{locationsPage.landing.gfwLists}</h2>
              )}

              <div className="gfw-lists__inner">{gfwListsMapped}</div>
            </section>
            <section className="my-locations-section">
              <div className="my-locations__header">
                {isUploadListUiAvailable ? (
                  <Typography variant="h6">{locationsPage.landing.myLocations}</Typography>
                ) : (
                  <div className="my-locations__title">{locationsPage.landing.myLocations}</div>
                )}

                <ListsFilter value={userListFilterText} onChange={onChangeListsFilter} />
              </div>
              {(userFoldersFiltered.length > 0 || userListsFiltered.length > 0) &&
                userListFilterText.length > 0 && (
                  <p className="search-result-count">
                    {`${numberWithCommas(
                      userListsFiltered.length + userFoldersFiltered.length
                    )} ${(userListsFiltered.length + userFoldersFiltered.length === 1
                      ? locationsPage.landing.resultItem
                      : locationsPage.landing.resultItems
                    ).toLowerCase()}`}
                  </p>
                )}
              {/* FOLDERS */}
              {userListFilterText.length === 0 && userFoldersFiltered.length > 0 && (
                <h3 className="my-folders-title">{locationsPage.landing.myFolders}</h3>
              )}
              {userFoldersFiltered.length > 0 && (
                <ul className="my-folders-list">{userFoldersFiltered}</ul>
              )}

              {/* LISTS */}
              {B2BsharedListEnabled && (
                <MyListsTabs
                  selectedTab={selectedTab}
                  onListsTabSelected={onListsTabSelected}
                  showMySharedLists={!!mySharedLists.length || true}
                  showListsSharedWithMe={!!listsSharedWithMe.length || true}
                />
              )}
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
                    Organize lists into folders by clicking a{' '}
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
                    button below.
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
                      if (isUploadListUiAvailable) {
                        const { history } = this.props;
                        history.push('/upload-location');
                      } else {
                        this.setState({ addLocationDialogOpen: true });
                      }
                    }}
                  >
                    {locationsPage.landing.addLocations}
                  </PillButton>
                </div>
              )}
              {/* SEARCH: NO RESULTS */}
              {userFoldersFiltered.length === 0 &&
                userListsFiltered.length === 0 &&
                userListFilterText.length > 0 && (
                  <div className="no-search-results">
                    <p className="no-search-results__message">
                      {locationsPage.landing.noSearchResults}
                    </p>
                    <LinkButton
                      className="no-search-results__clear"
                      label={locationsPage.landing.clearSearch}
                      onClick={() => this.setState({ userListFilterText: '' })}
                    />
                  </div>
                )}
            </section>
          </section>
        </section>
      </div>
    );
  }
}

export default withRouter(Landing);
