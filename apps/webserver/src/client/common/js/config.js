import _range from 'lodash/range';
import { fillYears } from './utils/configPopulation';
import { PLANET_BASEMAP } from '../../map/js/config/map.config';

export const DATA_API_URL = location.origin;

// NOTE: Requests to below endpoints are moved to backend `server/dataApi`
// export const PRODES_ANALYSIS_URL = 'https://data-api.globalforestwatch.org/dataset/inpe_prodes/latest/';
// export const VIIRS_ANALYSIS_URL = 'https://data-api.globalforestwatch.org/dataset/nasa_viirs_fire_alerts/latest/';

// New analysis types that utilize GFW API geostore ID
export const supportedGeostoreAnalysis = ['tree cover', 'glad', 'tree biomass', 'viirs', 'prodes'];

// Geostore admin URL
export const baseGeostoreURL = 'https://production-api.globalforestwatch.org/v2/geostore/';

export const oversizedUploadText =
  'Lists are limited to a maximum of 1,500 locations. Please cancel this edit and ensure your final list will contain no more than 1,500 locations.';

// IF YOU ARE CHANGING THE YEAR, CONSIDER SYNCING WITH libs/constants/src/lib/diagnostic-constants.ts
export const latestTreeCoverLossYearForTclDataInMap = 2024;
export const latestTreeCoverLossYearCommodityRisk = 2024;
export const earliestTreeCoverLossYearCommodityRisk = 2002;
export const latestTreeCoverLossYearForTclDataInAnalyses = 2024;

const todayIso = new Date().toISOString().split('T')[0];
const defaultStartYear = latestTreeCoverLossYearForTclDataInMap + 1;
const startIso = `${defaultStartYear}-01-01`;

export const soyPlantedYearsRange = { from: 2001, to: 2024 };
export const prodesYearsRange = {
  from: 2008,
  to: 2025,
};

export const dcfAlertsDateRange = {
  min: '2020-01-01',
  initialStart: `${latestTreeCoverLossYearForTclDataInMap + 1}-01-01`,
  max: todayIso,
};
export const deforestationAlertDateRange = {
  startDate: startIso,
  endDate: todayIso,
  minDate: `${latestTreeCoverLossYearForTclDataInMap + 1}-01-01`,
  maxDate: todayIso,
};
export const disturbanceAlertsVegetationTypes = {
  AllVegetation: 'all-vegetation',
  TreeCover: 'tree-cover',
};

export const GFW_PRO_USER_GUIDE = 'https://www.globalforestwatch.org/help/gfw-pro/';
export const GFW_PRO_HELP_CENTER__LINK = 'https://www.globalforestwatch.org/help/pro-login/';
export const GFW_PRO_HELP_CENTER__LABEL = 'Help Center';

export const pro_AWS_base = 'https://dpptfqp76xood.cloudfront.net';
export const aws_templates = `${pro_AWS_base}/templates/`;

export const termsAndConditions =
  'https://d1ps9kreypzu9a.cloudfront.net/Training%20Guides/GFW%20Pro%20Landing%20Page/World%20Resources%20Institute%20-%20GFW%20Pro%20-%20Terms%20of%20Service%207_2_2018.pdf';

export const termsOfServices = 'https://www.wri.org/about/legal-notices';

export const privacyPolicy = 'https://www.wri.org/about/privacy-policy';

export const licenseAgreement =
  'https://www.globalforestwatch.org/help/guides/global-forest-watch-pro-license-agreement/';

export const priceSheet =
  'https://www.globalforestwatch.org/help/guides/global-forest-watch-pro-price-sheet/';

export const sharedUrlDict = {
  gfwHeaderUrl: `${pro_AWS_base}/js/gfw-assets.nightly.js`,
};

export const loaderMessages = {
  defaultMessage: 'This may take a few minutes. Please do not navigate away from this page.',
  uploadHeader: 'Your locations are being uploaded.',
};

export const nav = {
  newsAndEvents: 'News & Events',
  about: 'About',
  users: 'Users',
  blog: 'Blog',
  selectLangageSpanish: 'Español',
  selectLangageEnglish: 'English',
  myGfwPro: 'My GFW Pro',
  username: 'Username',
  usernameOrEmail: 'Username or email',
  password: 'Password',
  forgotPassword: 'Forgot your password?',
  rememberMe: 'Remember me',
  login: 'Log in',
  requestAccount: 'Request an account',
  loginError: 'There was a login error!',
  more: 'More',
  menu: 'Menu',
  moreMenu: {
    apps: 'Apps',
    allApps: 'All apps',
    appsDescription: 'All our solutions in one place!',
    sharingAndSecurityDescription: 'Information about sharing and security.',
    about: 'About',
    blog: 'Blog',
    other: 'Other applications',
    exploreAllApps: 'Explore all apps',
    title: 'More in GFW Pro',
    howTo: 'How to Portal',
    security: 'Security',
    securityLink:
      'https://d1ps9kreypzu9a.cloudfront.net/Training%20Guides/GFW%20Pro%20Landing%20Page/World_Resources_Institute_GFW_Pro_Security.pdf',
    sharing: 'Sharing',
    sharingLink:
      'http://d1ps9kreypzu9a.cloudfront.net/Training%20Guides/GFW%20Pro%20Landing%20Page/GFW%20Pro%20Information%20Sharing%20One%20Pager_April2019.pdf',
  },
};

export const verifyCodePage = {
  pageTitle: 'GFW Pro Verification code',
  pagePrompt: 'Enter the code that was emailed to you.',
  inputLabel: 'Code',
  buttonLabel: 'Verify',
  backButtonLabel: 'Back to website',
  newCodeString1: 'Send new',
  newCodeString2: 'code.',
};

export const diagnosticsStrings = {
  listOrLocationNotFound: 'List or location not found',
};

export const locationsPage = {
  highchartSlugs: [
    'Indonesia-Legal-Classifications',
    'Land-Cover-Southeast-Asia',
    'Brazil-Biomes',
    'Indonesia-Land-Cover',
  ],

  lists: {
    confirmListUpdate: 'Confirm List Update',
    confirmListSubmission: 'Confirm Submission',
    addColumns: 'Add Columns',
    all: 'All',
    clearFilters: 'Clear filters',
    filter: 'Filter',
    filters: 'Filters',
    viewToggleLabel: 'View',
    viewForestChange: 'Forest Change',
    viewCommodityRisk: 'Commodity Risk',
    analyzing: 'Analyzing',
    failed: 'Failed',
    title: 'Lists',
    searchLists: 'Search Lists',
    searchStringInputPlaceholder: 'Type and press Enter',
    selectFilters: 'Select Filters',
    savedLocationsSummary: 'Summary',
    savedLocations: 'Saved Locations',
    allLocations: 'All Locations',
    investment: 'Investment',
    commodity: 'Commodity',
    commodityType: 'Commodity Type',
    locations: 'Locations',
    titleLocation: ' location',
    titleLocations: ' locations',
    titlePopoverCountries: 'Countries included',
    closePopover: 'Close',
    folderItem: 'list',
    folderItems: 'lists',
    myLists: 'My Lists',
    gfwLists: 'Global Forest Watch Lists',
    sharedLists: 'Shared Lists',
    listsFilterPlaceholder: 'Search lists...',
    listsFilterClear: 'Clear search',
    listsFilterNoMatch: 'Sorry, your search returned no results.',
    update: 'Update Analysis',
    submit: 'Submit Analysis',
    selectPlaceholder: 'Select...',
    selectCountry: 'Country',
    selectState: 'State',
    selectSubState: 'Sub state',
    parentCompanyLabel: 'Parent company',
    designationTypeLabel: 'Designation type',
    designationLabel: 'Designation',
    supplierLabel: 'Supplier',
    secondSupplierLabel: 'Second supplier',
    unselectAll: 'Unselect all',
    selectAll: 'Select all',
    filterModalTitle: 'Filters',
    protectedFiltersModalHeader: 'Show Protected Areas for',
    applyFilters: 'Apply filters',
    resetFilters: 'Reset',
    rerunListDialog: {
      title: 'Confirm Analysis Update',
      text: `<p>Click OK to submit this list for analysis. You will not be able to access the list until analysis is complete.
      You will receive an email notification when the update is completed.</p>
      <p>Note that running analysis counts towards your account usage limits. See more information <a target="_blank" href="/about?section=Fees">here</a>.</p>`,
    },
    cancel: 'Cancel',
    confirm: 'Confirm',
    copy: 'Copy',
    ok: 'OK',
    delete: 'Delete',
    move: 'Move',
    moveExistingDescription:
      'Note: Lists must have the same commodity defined in order to copy or move locations between lists. Your additional attribute data will be merged when attribute names match. Additional attribute data that does not match will be assigned separate columns.',
    moveLocationsDialogHeader: 'Move selection',
    copyLocationsDialogHeader: 'Copy selection',
    moveToNewListLabel: 'List name',
    moveToNewListDuplicate: 'A list with this name already exists',
    moveToNewListNameInvalid:
      'The list name chosen contains punctuation. Please choose a list name with only letters, numbers, and/or spaces.',
    existing: 'Existing list',
    new: 'Create new',
    diagnostic: 'Diagnostic',
    map: 'Map',
    download: 'Download…',
    csv: 'CSV',
    shapefile: 'Shapefile',
    share: 'Share',
    addToFolder: 'Add to folder',
    manage: 'Manage',
    changeTypeOfAnalysis: 'Change Type of analysis',
    deleteFolderTitle: 'Delete folder',
    deleteFolderPrompt: 'Are you sure you want to delete ',
    deleteFolderSuccessFragment: ' was deleted.',
    deleteFolderError: 'There was an error deleting the folder.',
    renameFolderTitle: 'Rename folder',
    renameFolderPrompt: 'Enter a new name to rename this folder.',
    renameFolderSuccessFragment: ' was renamed to ',
    renameFolderError: 'There was an error renaming the folder.',
    notFound: 'List not found',
    adminFilters: {
      modalHeader: 'Show Administrative Areas for',
      apply: 'Apply filters',
      selectCountry: 'Select...',
      selectStates: 'Select...',
      selectSubstates: 'Select...',
      selectCountryLabel: 'Country',
      selectStatesLabel: 'State',
      selectSubstatesLabel: 'Substate',
    },
    copyMoveMessages: {
      // server response keys
      ListTooLarge: { title: 'List exceeds maximum allowable size', message: oversizedUploadText },

      LocationAdded: {
        analytics: {
          title: 'create new list click',
          message: 'user copied locations from an existing list to create a new list',
        },
        title: 'Done',
        message: 'You have successfully uploaded your locations to a list.',
      },
      LocationsCopied: {
        analytics: {
          title: 'create new list click',
          message: 'user moved locations from an existing list to create a new list',
        },
        responseText: 'LocationsCopied',
        title: 'Locations Copied',
        message: 'You have successfully copied location(s) to an existing list.',
      },
      LocationMoved: {
        analytics: {
          title: 'create new list click',
          message: 'user copied locations from an existing list to a different pre-existing list',
        },
        title: 'Locations Moved',
        message: 'You have successfully moved your location(s) to an existing list.',
      },
      LocationAppended: {
        title: 'Done',
        message: 'You have successfully added these locations to a list.',
      },

      // moveLocations.js keys
      serverError: {
        title: 'Error in Locations',
        message: 'This account request has failed. Please try again at another time.',
      },
      listIsLocked: {
        title: 'List is locked',
        message:
          'The list that you have selected is currently being edited by another user. Please try again later.',
      },
      invalidListName: {
        title: 'Invalid List Name',
        message:
          'The list name chosen contains punctuation. Please choose a list name with only letters, numbers, and/or spaces.',
      },
      listNameAlreadyExists: {
        title: 'List not created',
        message: 'A list already exists with this name. Enter a new list name and click save.',
      },
      // listNotAccessible has no user-facing message
      listNotAccessible: { title: '', message: '' },
      missingListName: {
        title: 'Invalid List Name',
        message: 'You must create a new list or select an existing one.',
      },
    },
    deleteListDialog: {
      title: 'Confirm deletion',
      confirm: 'OK',
      cancel: 'Cancel',
      text: ' will be deleted. Please press ‘OK’ to confirm.',
    },
    deleteLocationsMessages: {
      confirm: {
        title: 'Confirm deletion',
        message:
          'Are you sure you want to delete the selected location(s)? After saving, your list will be in draft state until you re-run analysis to account for your changes. Note that running analysis counts towards your account usage limits. See more information about usage & fees <a href="/about?section=Fees" target="_blank">here</a>.',
      },
      error: {
        title: 'Location(s) not deleted',
        message: 'This account request has failed. Please try again at another time.',
      },
      listLocked: {
        title: 'List is locked',
        message:
          'The list that you have selected is currently being edited by another user. Please try again later',
      },
      success: {
        title: 'Location(s) Deleted',
        message:
          'You have successfully deleted location(s) from [list-name]. Your list will now be in draft state until you re-run analysis to account for your changes. Note that running analysis counts towards your account usage limits. See more information about usage & fees <a href="/about?section=Fees" target="_blank">here</a>.',
      },
    },
    moveLocationsMessages: {
      error: {
        title: 'Location(s) not moved',
        message: 'This account request has failed. Please try again at another time.',
      },
      listLocked: {
        title: 'List is locked',
        message:
          'The list that you have selected is currently being edited by another user. Please try again later',
      },
      success: { title: 'Location(s) Moved', message: 'Successfully moved the location(s).' },
    },
    manageFolderDialog: {
      addTitle: 'Add to folder',
      manageTitle: 'Move list to folder',
      confirm: 'Confirm',
      cancel: 'Cancel',
      // Translators: the name of the list is between these two strings
      add1: 'Add',
      add2: 'list to a new or existing folder',
      // Translators: the name of the list is between these two strings
      move1: 'Remove',
      move2: 'from this folder, or move it to a different folder',
      addToExisting: 'Add to existing',
      foldersSelectPlaceholder: 'Select...',
      createNew: 'Create new',
      removeFromFolder: 'Remove from folder',
      errorFolder: 'Error creating a new folder',
      errorList: 'Error adding list to folder',
      errorRemove: 'Error removing list from folder',
      // Translators: the name of the list is before string 1, and the name of
      // the folder is between these two strings
      added1: ' has been added to the ',
      added2: ' folder',
      // Translators: the name of the list is before string 1, and the name of
      // the folder is between these two strings
      moved1: ' has been moved to the ',
      moved2: ' folder',
      // Translators: the name of the list is before string 1, and the name of
      // the folder is between these two strings
      removed1: ' has been removed from the ',
      removed2: ' folder',
    },
    selectedCountry: 'Country',
    selectedCommodity: 'Commodity',
    selectedState: 'State',
    selectedSubState: 'Sub State',
    selectedCompany: 'Company',
    selectedArea: 'Area',
    selectedDesignationType: 'Designation Type',
    selectedDesignation: 'Designation',
    selectedNames: 'Names',
    selectedSupplier: 'Supplier',
    selectedSecondSupplier: 'Second Supplier',
    selectedParentCompany: 'Parent Company',
    selectedOverallThreats: 'Overall Threats',
    selectedOverallValues: 'Overall Values',
    selectedMillPriority: 'Mill Priority',
    selectedStates: 'States',
    selectedSubStates: 'Sub States',
    submitListDialog: {
      title: 'Confirm Analysis Submission',
      message:
        '<p>Click OK to submit this list for analysis. You will not be able to access the list until analysis is complete. You will receive an email notification when the update is completed.</p><p>Note that running analysis counts towards your account usage limits. See more information <a target="_blank" href="/about?section=Fees">here</a>.</p>',
    },
  },
  diagnosticsTitles: {
    TREE_COVER_LOSS: 'TREE COVER LOSS',
    TREE_COVER_LOSS_ON_ARGENTINA_OTBN: 'TREE COVER LOSS ON ARGENTINA OTBN',
    SOY_ON_TREE_COVER_LOSS: 'SOY ON TREE COVER LOSS',
    PRODES_AMAZON: 'PRODES (Amazon, Cerrado, Brazil)',
    ARGENTINA_OTBN_OVERLAP: 'ARGENTINA OTBN OVERLAP',
  },
  largeListEditing: {
    downloadProcessTitle: 'Upload process',
  },
  messageText: {
    investment: { text: 'Investment' },
    generic: { text: 'Generic' },
    other: { text: 'Other' },
    palmMill: { text: 'Palm Oil Mill' },
    palmPlantation: { text: 'Palm Oil Plantation' },
    palmFarm: { text: 'Palm Smallholder Farm' },
    palmGeneric: { text: 'Palm Oil Generic' },
    pulp: { text: 'Pulp and paper' },
    rubber: { text: 'Rubber' },
    soySilo: { text: 'Soy Silo' },
    soyFarm: { text: 'Soy Farm' },
    soyGeneric: { text: 'Soy Generic' },
    sugarCane: { text: 'Sugar Cane' },
    beef: { text: 'Beef Slaughterhouse' },
    cattle: { text: 'Cattle Ranch' },
    cattleGeneric: { text: 'Cattle Generic' },
    cocoa: { text: 'Cocoa Farm' },
    cocoaGeneric: { text: 'Cocoa Generic' },
    coffee: { text: 'Coffee' },
  },
  locationClassValues: {
    palmMill: { value: 'Supply Shed' },
    palmPlantation: { value: 'Property' },
    palmFarm: { value: 'Property' },
    cattle: { value: 'Property' },
    beef: { value: 'Supply Shed' },
    cocoa: { value: 'Property' },
    soyFarm: { value: 'Property' },
    soySilo: { value: 'Supply Shed' },
  },
  diagnostics: {
    lastDataYear: 2023,
  },
  landing: {
    foldersFeatureFlag: false,
    title: 'Locations',
    investment: 'Investment',
    investments: 'Investments',
    commodity: 'Commodity',
    commodities: 'Commodities',
    failedMessage: 'Analysis for this list failed. Please click update to try again.',
    pendingMessage:
      'List is analyzing. You will receive an email once analysis is complete and can reload the page to access the results.',
    draftMessage:
      'This list contains unanalyzed locations. Please click the submit button to run analysis. Once submitted, your list will not be accessible until analysis is complete.',
    addLocationsPrompt:
      '<p>Upload or enter locations by clicking the <strong>ADD LOCATIONS</strong> button. If you need help, read our <a target="_blank" class="no-lists__how-to" href="https://d1ps9kreypzu9a.cloudfront.net/Training%20Guides/GFW%20Pro%20Tutorials/GFW_Pro_UserGuide.pdf">how-to guide</a>.</p>',
    clearSearch: 'Clear search',
    noSearchResults: 'Sorry, your search returned no results.',
    total: 'Total',
    selectMethodOptions: [
      {
        commodityOrder: 3,
        investmentOrder: 1,
        label: 'By Address',
        landingLabel: 'Enter Address',
        id: 'byAddress',
        type: 'both',
      },
      // {commodityOrder: 5, investmentOrder: 5, label: 'By Selecting Administrative Region', landingLabel: 'Select Administrative Area', id: 'bySelection', type: 'both'},
      // {commodityOrder: 9, investmentOrder: 7, label: 'By Selecting Protected Area', landingLabel: 'Select Protected Area', id: 'byProtected', type: 'both'},
      // {commodityOrder: 7, investmentOrder: 6, label: 'By Selecting Concession Area', landingLabel: 'Select Concession Area', id: 'byConcession', type: 'both'},
      // {commodityOrder: 6, investmentOrder: 10, label: 'By Selecting Certified Area', landingLabel: 'Select Certified Area', id: 'byCertified', type: 'commodity'},
      // {commodityOrder: 8, investmentOrder: 10, label: 'By Selecting Palm Oil Mill', landingLabel: 'Select Palm Oil Mill', id: 'byPalmMill', type: 'commodity'},
      {
        commodityOrder: 2,
        investmentOrder: 3,
        label: 'By Drawing Shape',
        landingLabel: 'Draw a Shape',
        id: 'byDrawing',
        type: 'both',
      },
      {
        commodityOrder: 1,
        investmentOrder: 4,
        label: 'By Uploading Shape File',
        landingLabel: 'Upload a File',
        id: 'byUpload',
        type: 'both',
      },
    ],
    addLocation: 'Add a Location',
    addLocations: 'Add locations',
    addLocationChooser: {
      title: 'Choose single or multiple location upload',
      single: {
        id: 'AddSingleLocation',
        header: 'Add a single location',
        text: 'You will be able to enter an address or coordinates; draw a shape; or upload a shape file.',
      },
      multiple: {
        id: 'UploadMultipleLocations',
        header: 'Upload multiple locations',
        text: 'Start here to upload a file of less than 5MB and up to 1,500 locations.',
      },
    },
    download: 'Download',
    downloadMenuOpt: 'Download…',
    uploadLocation: 'Upload Locations',
    myLocations: 'My Locations',
    myLists: 'My Lists',
    mySharedLists: 'My Shared Lists',
    listsSharedWithMe: 'Lists Shared With Me',
    myFolders: 'My Folders',
    resultItem: 'result',
    resultItems: 'results',
    gfwLists: 'Global Forest Watch Lists',
    sharedLists: 'Shared Lists',
    tempLists: [
      {
        name: 'Brazil Soy',
        locations: 40,
        externalShared: false,
        internalShared: false,
      },
      {
        name: 'Paraguay Beef',
        locations: 25,
        externalShared: true,
        internalShared: true,
      },
      {
        name: 'Q3 Palm Mills',
        locations: 100,
        externalShared: true,
        internalShared: false,
      },
    ],
    tempSharedLists: [
      {
        list_name: 'Financial Institution B',
        locations: 40,
      },
      {
        list_name: 'Supplier 1 Q3 Palm Mills',
        locations: 20,
      },
    ],
  },
  add: {
    title: 'Add Location',
    enterCoordinates: 'Enter Coordinates',
    longitude: 'Longitude',
    latitude: 'Latitude',
    selectAdmin: 'Select Administrative Region',
    draw: {
      button: {
        startDrawing: 'Start Drawing',
        cancel: 'Cancel',
        redraw: 'Re-draw',
      },
      help: 'Click to start drawing, then click the first point to close your custom area of interest.',
    },
    dropdownOptions: [
      { label: 'Investment', id: 'investment' },
      { label: 'Commodity', id: 'commodity' },
    ],
    define: 'Location',
    investmentName: 'Investment name',
    locationLabel: 'Location: ',
    commodityName: 'Location name',
    defineRadiusHeader: 'Define radius around location',
    smallArea: 'Small',
    smallAreaSizeHint: '1000 hectares (1.78 km radius)',
    mediumArea: 'Medium',
    mediumAreaSizeHint: '5000 hectares (3.99 km radius)',
    largeArea: 'Large',
    largeAreaSizeHint: '20,000 hectares (7.98 km radius)',
    customAreaLabel: 'Custom area',
    customRadiusLabel: 'Custom radius',
    customAreaPlaceholder: 'Enter area (in ha) or radius (in km)',
    customAreaInputLabel: 'Enter area (in ha) or radius (in km)',
    calculatedSourcingArea: 'Calculated sourcing area (ha)',
    hectareAbbrev: 'ha',
    kilometerAbbrev: 'km',
    help: 'Help',
    suggestedRadii: 'Suggested radius',
    fiftyKmPalm: '50km for palm oil mills',
    thirtyKmSoy: '30km for soy silos',
    dash18KmCocoa: '0.5-18km for cocoa warehouses',
    suggestedAreas: 'Suggested areas',
    haPalm: '785,000 hectares for palm oil mills',
    haSoy: '283,000 hectares for soy silos',
    haCocoa: '80-102,000 hectares for cocoa warehouses',
    cancel: 'Cancel',
    continue: 'Continue',
    errors: {
      fileExtensionNotSupported: {
        title: 'File extension not supported',
        message: 'The supported file extensions are: csv, xlx, zip, kml, and kmz.',
      },
    },
    next: 'Next',
    prev: 'Previous',
    save: 'Save',
    yes: 'Yes',
    validLocation: ' valid location',
    validLocations: ' valid locations',
    invalidLocation: ' invalid location',
    invalidLocations: ' invalid locations',
    saveAndAddAnother: 'Save and add another',
    submit: 'Submit Analysis',
    upload: 'Upload File:',
    uploadError: 'Upload error',
    sizeOfInvestment: 'Size of Investment',
    timeframe: 'Review timeframe',
    timeframeDesc: 'Select start and end dates or time horizon for this location’s review period.',
    additionalMetadata: 'Additional metadata',
    startDate: 'Start Date',
    endDate: 'End Date',
    protectedAreas: {
      localhost: 'Lz6YLHN1eyIwJNZDNp1IkFglwrO6qQfAwwRGz-KkyrPDyOjRgiP02tf7gQnD0sRy',
      'pro-staging.globalforestwatch.org':
        'P9JirtCtnVDKuuxWwOOzhkjXTZhYZOdOX2lx9ucHcY9bwMkxyvwIq9cm4o7BiH4Cajir0vspLArlORz21jEI7A..',
      'gfwpro.globalforestwatch.org':
        'W6ezC-46IViJqpkOg4WvhoLeqgc5XwCY6US2vChHuAf0tSffb4gNXBEkzRwVT5t3gMLrs3TRPUfspw-5Z-dxTQ..',
      'pro.globalforestwatch.org':
        'MCrBhmBWwyPefdQamP74oGxZkDeWMoeP5qSUlKkeYxMInNyuC7e2Sg_5Cz70d8UQU4Y5lEALv2dedpuGo5Dv3A..',
    },

    address: 'Address',
    optional: '(optional)',

    addToAnExistingList: 'Add to an existing list',
  },
  upload: {
    errors: {
      uploadErrorDialogDownloadMessageTitle: 'Download error file',
    },
    filetypes: {
      title: 'Accepted filetypes:',
      csv: 'CSV or Excel file',
      zip: 'ZIP file containing a shapefile (SHP, DBF, SHX, and PRJ)',
      kml: 'KML or KMZ',
    },
    submit: 'Submit Analysis',
    list: 'List',
    analysis: 'List Analyses',
    addToExisting: 'Add to existing',
    createNew: 'Create new',
    browse: 'Browse',
    selectPlaceholder: 'Select…',
    show: 'Show',
  },
  columns: {
    notAnalyzedList: {
      owner:
        'This location has not been analyzed. To view location details and diagnostics for this list, please click the submit button at the top of the screen.',
      nonOwner:
        'This location has not been analyzed. The list owner will need to submit the list for analysis. Once submitted, this list will not be accessible until analysis is complete.',
    },
    tooltipMessage:
      'This location has failed analysis. To receive results, resubmit this list for analysis.',
  },
  usageReachingLimitBanner: {
    title: 'You have reached over 90% of your free usage limits.',
    text: 'After hitting your account limit, new and updated analyses will be unavailable until your account administrator purchases additional usage, or until your free usage limits renew on your annual account renewal date. Administrators may review the Usage dashboard for more information and to place an order.',
  },
  usegeReachedLimitBanner: {
    title: 'This account has consumed available use quantities.',
    text: 'New and updated analyses will be unavailable until your account administrator purchases additional usage, or until your free usage limits renew on your annual account renewal date. Administrators may review the Usage dashboard for more information and to place an order.',
  },
};

export const folderDetailPage = {
  breadcrumbLocation: 'Locations',
  folderItem: 'list',
  folderItems: 'lists',
  folderLocation: 'location',
  folderLocations: 'locations',
  noLists: 'This folder contains no lists!',
};

export const profilePage = {
  userProfile: {
    title: 'User Profile',
    contactInfo: 'Contact Information',
    backToManager: 'Back to Profile Manager',
    firstLabel: 'First Name *:',
    middleI: 'Middle Initial :',
    lastLabel: 'Last Name *:',
    emailLabel: 'E-mail *:',
    accountLabel: 'Account(s) *:',
    currentStatusLabel: 'Current User Status:',
    phoneLabel: 'Phone *:',

    accessLabel: 'Access Level *:',
    titleLabel: 'Title *:',
    geogLabel: 'Geographies:',
    interestsLabel: 'Interests:',
    alertTitle: 'Alerts Email Notifications Preferences',
    enableLabel: 'Enable Email Alert Notifications',

    currentLabel: 'Currently Sharing With:',
    shares: 'Shares',

    saveButton: 'Save',
    activateButton: 'Activate',
    deactivateButton: 'Deactivate',
    statusOptions: [
      {
        name: 'Draft',
        id: 0,
      },
      {
        name: 'Pending',
        id: 1,
      },
      {
        name: 'Active',
        id: 2,
      },
      {
        name: 'Inactive',
        id: 3,
      },
    ],
    accessOptions: [
      {
        name: 'Administrator',
        id: 1,
      },
      {
        name: 'Editor',
        id: 2,
      },
      {
        name: 'Viewer',
        id: 3,
      },
    ],
    viirsEmailFrequencies: [
      {
        name: 'Every Day',
        id: 4,
      },
      {
        name: 'Every Week',
        id: 3,
      },
      {
        name: 'Every Month',
        id: 2,
      },
      {
        name: 'Every Quarter',
        id: 1,
      },
      {
        name: 'Never',
        id: 0,
      },
    ],
    gladEmailFrequencies: [
      {
        name: 'Every Week',
        id: 3,
      },
      {
        name: 'Every Month',
        id: 2,
      },
      {
        name: 'Every Quarter',
        id: 1,
      },
      {
        name: 'Never',
        id: 0,
      },
    ],
    raddEmailFrequencies: [
      {
        name: 'Every Week',
        id: 3,
      },
      {
        name: 'Every Month',
        id: 2,
      },
      {
        name: 'Every Quarter',
        id: 1,
      },
      {
        name: 'Never',
        id: 0,
      },
    ],
    formaEmailFrequencies: [
      {
        name: 'Every Month',
        id: 2,
      },
      {
        name: 'Every Quarter',
        id: 1,
      },
      {
        name: 'Never',
        id: 0,
      },
    ],
    granChacoEmailFrequencies: [
      {
        name: 'Every Month',
        id: 2,
      },
      {
        name: 'Every Quarter',
        id: 1,
      },
      {
        name: 'Never',
        id: 0,
      },
    ],
  },
  profileManager: {
    title: 'Profile manager',
    userProfileTitle: 'User Profile',
    accountProfiles: 'Account Profiles',
    searchAccounts: 'search accounts...',
    createNew: 'Create New',
    viewActivityLog: 'View Activity Log',
    download: 'Download',
    userProfiles: 'Users',
    activityLogTitle: 'Activity log',
    searchUsers: 'Search users',
    searchLogs: 'search logs...',
    deactivateAll: 'Deactivate All',
    userAccountFields: [
      // 'Organization ID',
      'User Name',
      'E-mail',
      'Phone',
      'Title',
      // 'Organization Classifications',
      // 'Sharing',
      'Access Level',
      'User Status', // ,
      // 'email_subscription'
    ],
    organizationTitle: 'Organization',
    multiselectPrompt: 'Select one or more.',
    selectCountry: 'Select Country',
    policyPrompt: 'Upload policy document to reference within the system (.doc, .pdf)',
    policyUpload: 'Upload',
    policyDelete: 'Delete Documents',
    policyDownload: 'Download',
    accountProfileFields: [
      'Name',
      'Subsidiary',
      'Address',
      'Website',
      'Parent organization',
      'Policy',
      'Account classifications',
      'Current account status',
    ],
    backButton: 'Back to Profile Manager',
    userContactInfoTitle: 'Contact information',
    userProfileInfoTitle: 'Profile information',
    userProfilePrompt: 'Please complete all mandatory fields * below.',
    userSecondLevelTitle: 'Second Level Authentication Preferences',
    userSecondLevelPrompt: 'Select your preferred method for account verification.',
    userContactFields: ['First name', 'Last name', 'E-mail', 'Current user status', 'Phone'],
    userProfileFields: [
      'Access Level',
      'Title',
      'E-mail',
      'Current user status',
      'Phone',
      'Geographies of interest',
      'Commodities of Interest',
    ],
    googleVerifyPrompt: 'Open your Google Authenticator App and scan the image!',
    googleSecretPrompt: 'Camera not working? Copy & paste the secret!',
    secondLevelFields: ['E-mail', 'Google Authenticator'],
    save: 'Save',
    cancel: 'Cancel',
    activate: 'Activate',
    changePassword: 'Change password',
    resetPassword: 'Reset password',
    deactivate: 'Deactivate',
    activityLogHeaders: [
      'Username',
      'Category',
      'Activity name',
      'Activity description',
      'Timestamp',
    ],
  },
  accountUsage: {
    title:
      'Analytics usage for subscription year ({subscriptionYearStart} to {subscriptionYearEnd})',
    locationsAnalyzed: 'Locations Analyzed',
    areaAnalyzed: 'Hectares Analyzed',
  },
};

export const PLANET_TILE_LAYER_INITIAL = 'global_monthly_2025_03_mosaic';

export const mapPage = {
  drawTitle: 'Draw a Shape',
  countryTitle: 'Country or Region',
  drawInstructions: 'Draw in the map the area you want to analyze or subscribe to',
  otherInstructions: 'Analyze or subscribe to a shape on the map',
  analyzeInstructionsTitle: 'ANALYZE A SHAPE ON THE MAP',
  analyzeInstructions:
    'This feature allows you to analyze forest change statistics for individual data shapes (i.e, polygons) within certain layers. Analysis is currently available for most data layers under the Land Use, Conservation, and People tabs, in addition to all country data layers. Turn on the layer you wish to analyze and follow the instructions.',
  analyzeInstructionsTwo: 'For more help analyzing a data shape on the map, visit the ',
  analyzeInstructionsThree: 'How To page.',
  analyzeInstructionsLink:
    'https://www.globalforestwatch.org/howto/conduct-analysis-and-subscribe-to-alerts?t=analyze-or-subscribe-to-alerts-for-a-land-use-concession-or-protected-area',
  totalSelected: 'TOTAL SELECTED AREA',
  totalLoss: 'LOSS',
  algorithmDisclaimer:
    'This algorithm approximates the results by sampling the selected area. Results are more accurate at closer zoom levels.',
  noteDisclaimer:
    'NOTE: tree cover loss and gain statistics cannot be compared against each other.',
  noteDisclaimerText: ' Learn more.',
  noteDisclaimerLink:
    'https://www.globalforestwatch.org/map/5/13.60/97.91/ARG/grayscale/loss/582,573,556?tab=analysis-tab&geostore=a794f8f3f3e57373910c40cb95625f28&begin=2001-01-01&end=2016-01-01&threshold=30&dont_analyze=true#',

  uploadLabel: 'CLICK TO PICK A FILE OR DROP ONE HERE',
  otherSteps: [
    'Use the tabs above the map to turn on a data layer',
    'Select a shape in the map',
    'Click “Analyze” or “Subscribe”',
  ],
  biomassLossYears: [
    2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016,
  ],
  // treeCoverLossYears: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017],
  treeCoverLossYearsFC: fillYears(2001, latestTreeCoverLossYearForTclDataInMap),
  granChacoLossYears: [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018],
  prodesLossYears: _range(2001, 2020 + 1),
  share: {
    title: 'Share this view',
    linkInstructions:
      'Copy and paste the link to share it or use the buttons below to share on social media.',
    copyFailure:
      'Sorry, we were unable to copy this to your clipboard, please press Cmd + c on Mac or Ctrl + c on Windows/Linux.',
    copyButton: 'Copy',
    copiedButton: 'Copied',
    googleUrl: (url) => `https://plus.google.com/share?url=${url}`,
    twitterUrl: (url) => `https://twitter.com/share?url=${url}&via=gfw-water`,
    facebookUrl: (url) => `https://www.facebook.com/sharer.php?u=${url}`,
  },
  groundBiomassStart: 'Displaying above ground biomass',
  densityLossStart: 'Displaying cover with ',
  densityLossEnd: ' canopy density.',
  basemaps: [
    {
      id: 'custom-default',
      label: 'Default',
      customVectorUrl: `${pro_AWS_base}/basemaps/basemap-default.json`,
      content:
        '<div class="basemap-modal-title">DEFAULT</div><p>The default base map is derived from Google Maps and shows political boundaries, major geological features, and other key areas of interest. Read the terms of service <a href="https://www.google.com/help/terms_maps.html" target="_blank">here</a>.</p>',
    },
    {
      id: 'custom-terrain',
      label: 'Terrain',
      customVectorUrl: `${pro_AWS_base}/basemaps/basemap-terrain.json`,
      // customVectorUrl: 'https://gist.githubusercontent.com/ziveo/13ddb84ab0d929808a2b19c6d7df5716/raw/6cc0a1ab1571970ab4a3273175ff93560d23fb73/basemap-terrain.json',
      content:
        '<div class="basemap-modal-title">TERRAIN</div><p>Google Maps’ terrain base map shows geographical and topographical details. Scale varies by location. Read the terms of service <a href="https://www.google.com/help/terms_maps.html" target="_blank">here</a>.</p>',
    },
    {
      id: 'satellite',
      label: 'Satellite',
      customUrl: 'https://mt1.google.com/vt/lyrs=s&x={col}&y={row}&z={level}',
      content:
        '<div class="basemap-modal-title">Satellite</div><p>Google Maps’ satellite base map consists of a mix of recent (1–3 years ' +
        'old) mid-resolution and high-resolution satellite and aerial imagery from multiple providers' +
        ' for a given area. TerraMetrics TruEarth 15-meter imagery is the baselayer imagery that ' +
        'covers the entire globe, and Google adds high-resolution imagery, where available, over ' +
        'TruEarth 15-meter imagery to provide additional visual details. Read the terms of service <a href="http://www.google.com/help/terms_maps.html" target="_blank">here</a>.</p>',
    },
    {
      id: 'landsat',
      label: 'Landsat',
      customUrl:
        'https://production-api.globalforestwatch.org/v2/landsat-tiles/2017/{level}/{col}/{row}',
      content:
        '<div class="basemap-modal-title">Landsat</div><p class="first">These base maps show a composite of the best annual Landsat satellite imagery (USGS/NASA) from 2013-2017. The annual composites were generated by Google in the Google Earth Engine. The Landsat composites display “Top-of-Atmosphere,” or the most cloud-free, images at 30-meter resolution. More information on Landsat imagery is available from the <a href="http://landsat.usgs.gov/" target="_blank">Landsat website</a>. Read the terms of service <a href="http://www.google.com/help/terms_maps.html" target="_blank">here</a>.</p><p><strong>Note:</strong> Because of the very large file size of the annual Landsat composite layers, images will take some time to reload on the website and as you zoom in and out.</p>',
    },
    {
      id: 'osm',
      label: 'Open Street Map',
      content:
        '<div class="basemap-modal-title">Open Street Map</div>Open Street Map is a free, editable map of the whole world that is crowd-sourced and ' +
        'released with an open-content license. Data can be edited or downloaded at <a href="http://www.openstreetmap.org/" target="_blank">http://www.openstreetmap.org/</a>',
    },
    {
      id: 'hybrid',
      label: 'Hybrid',
      customUrl: 'https://mt1.google.com/vt/lyrs=s&x={col}&y={row}&z={level}',
      content:
        '<div class="basemap-modal-title">Hybrid</div><p class="first">Google Maps Road Network base map shows the extent of collected and generated road features. The map is proprietary to Google and cannot be downloaded. Scale varies by location. Read the terms of service <a href="http://www.google.com/help/terms_maps.html" target="_blank">here</a>.</p>',
    },
    {
      id: 'tree-height',
      label: 'Tree Height',
      customUrl: 'https://s3.amazonaws.com/wri-tiles/tree-height/{level}/{col}/{row}.png',
      content:
        '<div class="basemap-modal-title">Tree Height</div><p>This base map depicts the highest points in the forest canopy. Its spatial resolution is 0.6 miles ' +
        '(1 km) and was validated against data from a network of nearly 70 ground sites around the world. It was ' +
        'developed by a team of scientists from NASA’s Jet Propulsion Laboratory, Pasadena, California; the University ' +
        'of Maryland, College Park; and Woods Hole Research Center, Falmouth, Massachusetts. The map was created using ' +
        '2.5 million carefully screened, globally distributed laser pulse measurements from space. The light detection and ' +
        'ranging (Lidar) data were collected in 2005 by the Geoscience Laser Altimeter System instrument on NASA’s Ice, Cloud, ' +
        'and land Elevation Satellite (ICESat).</p>',
    },
    {
      id: PLANET_BASEMAP,
      label: 'Planet',
      customUrl: `${window.location.origin}/map/getPlanetTile/basemaps/v1/planet-tiles/${PLANET_TILE_LAYER_INITIAL}/gmap/{level}/{col}/{row}.png?proc=rgb`,
      content:
        '<div class="basemap-modal-title">Planet</div>' +
        '<p>The “Planet” basemap provides high-resolution satellite imagery and is sourced from Planet Labs, Inc. The 5-meter resolution mosaics are updated monthly starting September 2020 and are available for the tropics. Six-month mosaics are also available for past years. Because of its frequent updates and high-resolution imagery, the Planet basemap is useful for investigating an area and analyzing loss patterns in the imagery. You can select imagery from a specific time period by clicking the applicable drop-down menu below the Planet icon. The latest imagery is the default when activating this basemap. Learn more about how to investigate forest change with satellite imagery <a target="_blank" href="https://www.globalforestwatch.org/help/map/guides/investigate-forest-change-satellite-imagery/">here</a>. Thanks to Norway’s International Climate and Forest Initiative (NICFI), the Planet mosaics are also available to those working to stop deforestation and combat climate change. Visit this <a target="_blank" href="https://www.planet.com/nicfi/">webpage</a> to register for a free account and select the mosaics you would like to download.</p>',
    },
  ],
};

export const userAccessLevel = {
  ADMIN: 1,
  EDITOR: 2,
  VIEWER: 3,
};

export const SAVED_LOCATIONS = ['All Locations', 'Investments', 'Commodities'];

export const draftTooltipMessages = {
  owner:
    'This list contains unanalyzed locations. Please click the submit button to run analysis. Once submitted, your list will not be accessible until analysis is complete.',
  nonOwner:
    'This list contains unanalyzed locations. The list owner will need to submit the list for analysis. Once submitted, this list will not be accessible until analysis is complete.',
};

export const SUBSCRIPTION_STATUSES = {
  STANDARD: 1,
  PREMIUM: 2,
};

export const subscriptionStatusOptions = [
  { label: 'Standard', value: SUBSCRIPTION_STATUSES.STANDARD },
  { label: 'Premium', value: SUBSCRIPTION_STATUSES.PREMIUM },
];

export const accountProfileStrings = {
  sectionTitles: {
    profileForm: 'Account Profile',
    statusSetting: 'Account Status',
    limitsSetting: 'Account Limits',
    accountUsers: 'Users',
    accountUsage: 'Account Usage',
    accountProfiles: 'Account Profiles',
  },
  accountUsageLabels: {
    organizationName: 'Organization Name',
    numberOfLists: 'Number of lists',
    maxAreaPerList: 'Max area per list',
    totalAreaAnalyzed: 'Total area analyzed',
    locationsAnalyzed: 'Locations analyzed',
    hectaresAnalyzed: 'Hectares analyzed (HA)',
    listsAnalyzed: 'Lists analyzed',
    analysisType: 'Analysis type',
  },
  accountFormLabels: {
    org_name: 'Organization Name',
    org_address: 'Organization Address',
    org_website: 'Organization Website',
    parent_org_name: 'Parent Organization',
    is_subsidiary: 'Is Subsidiary?',
    arr_org_classification: 'Account Classifications',
    arr_org_policy: 'Organization Policy',
    subscription_status_id: 'Subscription Status',
  },
  accountLimitsSetting: {
    locationsPerYear: 'Locations Per Year',
    tokensPerYear: 'Tokens Per Year',
    areaPerYear: 'Area Per Year',
    subHeadingSubscriptionLimits: ' Subscription',
    subHeadingCustomLimits: 'Extended Limits',
    subHeadingToAddExtraLimits: 'Add Limits',
  },
  dateRangeSelector: {
    selectStartDate: 'Select start date:',
    selectEndDate: 'Select end date:',
  },
};

export const accountLimitsStrings = {
  pageHeading: 'Account Limits',
  stantardSubscriptionSection: 'Standard Subscription',
  premiumSubscriptionSection: 'Premium Subscription',
  locationsPerYear: 'Locations Per Year',
  tokensPerYear: 'Tokens Per Year',
  areaPerYear: 'Area Per Year',
};

export const featureFlagsStrings = {
  pageHeading: 'Features',
  addCompanyDialogTitle: 'Select Organization',
};
