/* eslint-disable camelcase */
/* eslint-disable no-restricted-globals */
import _range from 'lodash/range';

import { fillYears } from './utils/configPopulation';
import { saveAsDraftListConfig } from '../../../config/config/locations.config';
import { PLANET_BASEMAP } from '../../map/js/config/map.config';
import { proLayers } from './proLayers.config';

export const DATA_API_URL = location.origin;

// NOTE: Requests to below endpoints are moved to backend `server/dataApi`
// export const PRODES_ANALYSIS_URL = 'https://data-api.globalforestwatch.org/dataset/inpe_prodes/latest/';
// export const VIIRS_ANALYSIS_URL = 'https://data-api.globalforestwatch.org/dataset/nasa_viirs_fire_alerts/latest/';

// New analysis types that utilize GFW API geostore ID
export const supportedGeostoreAnalysis = ['tree cover', 'glad', 'tree biomass', 'viirs', 'prodes'];

// GADM Admin Service URL
export const GADM_SERVICE__PROD =
  'https://gfwpro-gis.globalforestwatch.org/arcgis/rest/services/GADM36_admin_2_gridded/MapServer/0'; // Only for production
export const GADM_SERVICE__STAGING =
  'https://gfwpro-gis-stg.globalforestwatch.org/arcgis/rest/services/GADM36_admin_2_gridded/MapServer/0'; // All others environments

// Geostore admin URL
export const baseGeostoreURL = 'https://production-api.globalforestwatch.org/v2/geostore/';

export const convertURL = 'https://production-api.globalforestwatch.org/v2/ogr/convert';

export const oversizedUploadText =
  'Lists are limited to a maximum of 1,500 locations. Please cancel this edit and ensure your final list will contain no more than 1,500 locations.';
export const latestTreeCoverLossYearForTclDataInMap = 2023;
export const latestTreeCoverLossYearCommodityRisk = 2022;
export const earliestTreeCoverLossYearCommodityRisk = 2002;
export const latestTreeCoverLossYearForTclDataInAnalyses = 2023;

export const soyPlantedYearsRange = [2001, 2022];

export const treeCoverLossTilesUrl =
  'https://tiles.globalforestwatch.org/umd_tree_cover_loss/v1.11/tcd_{thresh}/{z}/{x}/{y}.png';

export const GFW_PRO_USER_GUIDE = 'https://www.globalforestwatch.org/help/gfw-pro/';
export const GFW_PRO_HELP_CENTER__LINK = 'https://www.globalforestwatch.org/help/pro-login/';
export const GFW_PRO_HELP_CENTER__LABEL = 'Help Center';

export const pro_AWS_base = 'https://dpptfqp76xood.cloudfront.net';
const aws_templates = `${pro_AWS_base}/templates/`;

export const termsAndConditions =
  'https://d1ps9kreypzu9a.cloudfront.net/Training%20Guides/GFW%20Pro%20Landing%20Page/World%20Resources%20Institute%20-%20GFW%20Pro%20-%20Terms%20of%20Service%207_2_2018.pdf';

export const termsOfServices = 'https://www.wri.org/about/wri-data-platforms-tos';

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
  dashboardMessage:
    'Please leave this window open while alerts are processing. Results will appear on the Dashboard shortly. Lists larger than 1,000 locations may take up to 5 minutes to process. Please try again if the list fails to process after 5 minutes.',
};

export const nav = {
  newsAndEnvents: 'News & Events',
  about: 'About',
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

export const aboutPage = {
  heroTitle: 'About',
  heroDescription:
    'Global Forest Watch Pro (GFW Pro) is an online management application to support reducing deforestation in commodity supply chains. GFW Pro delivers critical decision-making analysis at the property, supply shed and portfolio levels. The platform also empowers users, from commodity field officers to financial Chief Risk Officers, to manage and monitor changes in deforestation risk. The application is built upon best-in-class, timely data from the <a href="http://www.globalforestwatch.org/about/the-gfw-partnership" target="_blank">Global Forest Watch Partnership</a> and World Resources Institute’s scientific research.',
  aboutTitle: 'About GFW',
  aboutDescription:
    '<p>The agricultural industry is essential for human well-being, yet it is often associated with harmful <a href="http://www.pnas.org/content/108/9/3465.full?sid" target="_blank">tropical deforestation</a>. That fact, coupled with growing consumer awareness of a global sustainability crisis, is creating pressure on companies and financial institutions operating in agricultural supply chains to address their impact. The business imperative to use land more sustainably and reduce forest impacts is increasingly obvious: supply chains are more secure long-term, livelihoods for those who depend locally on forests are protected, and globally forests are integral to protecting biodiversity and safeguarding the climate by sequestering carbon. Many companies have responded by making zero-deforestation commitments. Technology enables them to do so by making forest and land monitoring more precise and efficient than ever.</p><p>GFW Pro allows companies to manage geospatial data with ease through analysis and dashboards designed for commodity companies and banks’ day-to-day operations. Freely available to all, it unites users within complex commodity supply chains around a common approach to quantify and manage progress towards meeting deforestation commitments, adhere to commitments, and demonstrate regulatory compliance.</p><p>GFW Pro was developed by World Resources Institute (WRI) with help from 60+ GFW leading technology, data, NGO, service provider, and private sector industry partners. See the complete list of our GFW partners <a href="http://www.globalforestwatch.org/about/" target="_blank">here</a>.</p>',
  historyTitle: 'History',
  historyDescription:
    '<p>Anyone with an internet connection can now monitor deforestation in near real-time, in areas as small as a soccer penalty box. The Global Forest Watch (GFW) partnership, convened by World Resources Institute (WRI), has ushered in a new era of radical transparency for forests, enabled by cutting edge satellite imagery, data analysis and communication technologies.</p><p>Since 2014, WRI has been working with companies and financial institutions at the forefront of sustainability to understand how GFW can support implementation of zero-deforestation commitments and promote sustainable commodities production and trade. The GFW Commodities (scheduled to be decommissioned in 2018) application surfaced geospatial data for monitoring and analyzing deforestation risk in oil palm and soy supply chains. In 2016, following consultations with more than 60 finance sector professionals, WRI released a prototype of a GFW Finance application. Many commodity companies and financial institutions showed tremendous interest in and demand for both applications.</p><p>In 2017, WRI proposed to integrate GFW Commodities and Finance functionality into GFW Pro – a common platform built specifically to provide an internal management and decision-support system for companies operating in agricultural supply chains. GFW Pro promises to provide business-ready insights about land-related sustainability performance – starting with, but not limited to, deforestation-free compliance analysis – through a secure and customizable workflow application.</p><p>More than 15 leading companies, financial institutions and NGOs officially endorsed the GFW Pro vision, which was <a href="https://www.wri.org/news/2017/01/release-partnership-launches-increase-transparency-and-traceability-across-supply" target="_blank">formally launched</a> at the World Economic Forum Annual Meeting in January 2017.</p>',
  tutorialsTitle: 'Tutorials',
  tutorialsDescription:
    'Global Forest Watch Pro offers a wide range of content and capabilities to serve a variety of users and purposes. Whether you arrive at GFW Pro with a clear purpose or are simply exploring different features, we can help you learn to use the platform.',
  feesTitle: 'Fees',
  feesDescription: [
    'Creating and maintaining an account on GFW Pro is free. Our goal is to make GFW Pro available as a public good accessible by all supply chain actors and thereby foster more sustainable commodity sourcing decisions. An annual free grant of 5,000 per-location analyses and 100 million hectares of processing is provided to each organization. For most organizations, this is sufficient for internal operational and sustainability assessments as well as direct reporting to government regulators and nonprofit administrators of voluntary commitments.',
    'To support rapid user growth and increased demand for product upgrades, both of which drive up operational costs, we charge fees for usage that exceeds the free annual allowance, and for licenses to publish, distribute or resell GFW Pro content to third parties.',
    'To maintain GFW Pro as a widely accessible public good, we ask our users to support the platform by paying a fair fee to share analyses and for usage that exceeds the free use limit.',
    'For more information on GFW Pro packages and prices, please refer to our <a data-testid="link-with-safety" href="https://www.globalforestwatch.org/help/guides/global-forest-watch-pro-price-sheet/">price list</a>&nbsp;and <a data-testid="link-with-safety" href="https://www.globalforestwatch.org/help/guides/global-forest-watch-pro-license-agreement/">license agreement</a>. If you have an existing GFW Pro account, the&nbsp;<a data-testid="link-with-safety" href="https://www.globalforestwatch.org/help/gfw-pro/faq-subscription-fee-model-faq/">fee model FAQ page</a>&nbsp;offers additional information and some relevant examples. Otherwise, please <a data-testid="link-with-safety" href="mailto:GFWPROsales@wri.org">contact our sales team for more information</a>.',
  ],
};

export const loginPage = {
  appTitleText: 'Achieve supply chain sustainability with analytics that deliver impact.',
  appRequestAccount: 'Request an Account',
  appLearnMore: 'Learn more about Pro',
  moreInfo: {
    help: {
      paragraphText: 'Find out how GFW Pro can help you and your organization.',
      buttonText: 'Contact us',
      link: 'mailto:GFWPROsales@wri.org',
    },
    subscribe: {
      paragraphText: 'Follow us on LinkedIn to see the latest news and updates from GFW Pro',
      buttonText: 'GFW LinkedIn page',
      link: 'https://www.linkedin.com/showcase/globalforestwatch/',
    },
  },
  latestResearchTitle: 'Latest Research and Insights',
  latestResearchArticles: [
    {
      title: "Save the Forests? There's an App for That.",
      credit: 'by Luiz Amaral and Andrew Steer, ',
      date: 'January 18, 2017',
      url: '',
    },
    {
      title: 'How fintech can help banks tackle deforestation',
      credit: 'by Luiz Amaral, ',
      date: 'March 28, 2017',
      url: '',
    },
  ],
  whyGfwPro: {
    title: 'Why Use Global Forest Watch Pro?',
    body: 'Global Forest Watch Pro is the industry-standard platform that makes the latest forest mapping technology and analysis accessible to commodity and finance professionals for analysis, monitoring and reporting.',
  },
  appFeatures: {
    title:
      'GFW Pro was designed with leading companies and financial institutions to translate geospatial data into actionable insights. Platform capabilities include:',
    features: [
      {
        text: 'Monitor conditions at farms, supply sheds or jurisdictions and track changes over time',
        image: 'icon-lg-share.svg',
      },
      {
        text: 'Verify and demonstrate compliance with commitments and regulations like the European Union’s deforestation regulation (EUDR).',
        image: 'icon-lg-monitor.svg',
      },
      {
        text: 'Share data and analyses across teams and the broader organization via secure workflows.',
        image: 'icon-lg-compliance.svg',
      },
    ],
  },
  actions: [
    {
      description: 'Why GFW Pro?',
      action: 'watch the video',
      requestDemo: false,
    },
    {
      description: 'Request a demo from the GFW Pro team',
      action: '',
      requestDemo: true,
    },
  ],
  quoteTitle: 'What people are saying about Global Forest Watch Pro',
  quotes: [
    {
      text:
        '“Minimizing environmental risks in our operations is a critical challenge. Illegal and unintended deforestation can violate ' +
        'local legislation, negatively affect financial performance, and present reputational risk to all parties. GFW Pro is on the leading ' +
        'edge of technology and data applications that will help us work with our clients to better identify and manage deforestation risk. ' +
        'That’s delivering positive impact for our clients, for the countries in our region, and for future generations.”',
      name: 'Luiz Gabriel Todt de Azevedo',
      organization: 'IDB Invest',
      title: 'Chief, Environmental, Social & Governance Division',
      image: 'headshot_luiz_gabriel_todt_de_azevedo.jpg',
    },
    {
      text: '“GFW Pro allows us to upload all our production areas, monitor them for deforestation on a day-to-day basis, and prioritize engagement accurately and efficiently. It’s a win-win.”',
      name: 'Moray McLeish',
      organization: 'Asia, Olam',
      title: 'Vice President, Corporate Responsibility and Sustainability',
      image: 'headshot_moray_mcleish.jpg',
    },
    {
      text: '“We’ve worked extensively with WRI’s advisory services to analyze forest impacts in our supply chains. GFW Pro will make these forest analyses easily accessible, allowing us to manage deforestation risks in our supply chains more efficiently. We are also excited to see WRI’s methods become more widely used.”',
      name: 'Alexandra Experton',
      organization: 'Cargill Agricultural Supply Chain - Asia Pacific',
      title: 'Supply Chain Sustainability Manager',
      image: 'headshot_alexandra_experton.jpg',
    },
    {
      text: '“Mondelēz International is committed to addressing deforestation in our key raw materials, by engaging suppliers and influencing sector wide change. It’s time for all of us in the industry to stop duplicating efforts and start collaborating on one tool that can help us all meet our commitments in a harmonized, consistent manner. GFW Pro is that tool.”',
      name: 'Karimah Hudda',
      organization: 'Mondelez International',
      title: 'Global Sustainability Lead',
      image: 'headshot_karimah_hudda.jpg',
    },
  ],
  monitorSectionTitle: 'What can Global Forest Watch Pro do for you?',
  monitorSection: {
    title: '',
    subsections: [
      {
        id: 'banker',
        title: 'Banker',
        quote:
          '“Minimizing environmental risks in our operations is a critical challenge. Illegal and unintended deforestation can violate ' +
          'local legislation, negatively affect financial performance, and present reputational risk to all parties. GFW Pro is on the leading ' +
          'edge of technology and data applications that will help us work with our clients to better identify and manage deforestation risk. ' +
          'That’s delivering positive impact for our clients, for the countries in our region, and for future generations.”',
        image: 'banker.jpg',
        quoteRef:
          'Luiz Gabriel Todt de Azevedo, Chief, Environmental, Social & Governance Division - IDB Invest',
        descriptions: [
          {
            title: 'Upload & Save',
            description:
              'Create a portfolio of your investment locations within GFW Pro and access tailored screenings based on the location type.',
          },
          {
            title: 'Analyze & Monitor',
            description:
              'Discover compliance-related forest insights to assess risk and prioritize.',
          },
          {
            title: 'Collaborate',
            description:
              'Share forest risk assessments with and receive priority locations from colleagues through Pro.',
          },
          {
            title: 'Manage',
            description: 'Develop environmental plans to mitigate risks and monitor performance.',
          },
        ],
      },
      {
        id: 'producer',
        title: 'Producer',
        quote:
          '“GFW Pro allows us to upload all our production areas, monitor them for deforestation on a day-to-day basis, and prioritize engagement accurately and efficiently. It’s a win-win.”',
        image: 'producer.jpg',
        quoteRef:
          'Moray McLeish, Vice President, Corporate Responsibility and Sustainability for Asia, Olam',
        descriptions: [
          {
            title: 'Upload & Save',
            description:
              'Create a portfolio of your productions areas (e.g. soy farms, palm oil concessions) in GFW Pro.',
          },
          {
            title: 'Analyze & Monitor',
            description: 'Monitor production areas for forest clearing or fire activity.',
          },
          {
            title: 'Collaborate',
            description:
              'Share assessments and progress towards mitigating forest clearance and fire activity with colleagues or buyers.',
          },
          {
            title: 'Manage',
            description:
              'Flag production areas with concerning clearance or fire activity to prioritize engagement and mitigation efforts.',
          },
        ],
      },
      {
        id: 'commodityTrader',
        title: 'Commodity Trader',
        quote:
          '“We’ve worked extensively with WRI’s advisory services to analyze forest impacts in our supply chains. GFW Pro will make ' +
          'these forest analyses easily accessible, allowing us to manage deforestation risks in our supply chains more efficiently. We are ' +
          'also excited to see WRI’s methods become more widely used.”',
        image: 'trader.jpg',
        quoteRef:
          'Alexandra Experton, Supply Chain Sustainability Manager, Cargill Agricultural Supply Chain - Asia Pacific',
        descriptions: [
          {
            title: 'Upload & Save',
            description:
              'Create a portfolio within GFW Pro of production locations received from your suppliers.',
          },
          {
            title: 'Analyze & Monitor',
            description:
              'Identify areas at risk within your supply chain and assess compliance with the EUDR or progress towards zero-deforestation commitments.',
          },
          {
            title: 'Collaborate',
            description:
              'Send aggregated risk and progress assessments to colleagues and generate reports for buyers. Integrate into due diligence processes for the EUDR.',
          },
          {
            title: 'Manage',
            description:
              'Identify priority areas in your supply chain for complying with the EUDR and adhering to zero-deforestation commitments.',
          },
        ],
      },
      {
        id: 'goodsManufacturer',
        title: 'Consumer Goods Manufacturer',
        quote:
          'Mondelēz International is committed to addressing deforestation in our key raw materials, by engaging suppliers and ' +
          'influencing sector wide change. It’s time for all of us in the industry to stop duplicating efforts and start collaborating on ' +
          'one tool that can help us all meet our commitments in a harmonized, consistent manner. GFW Pro is that tool.',
        image: 'consumer-goods.jpg',
        quoteRef: 'Karimah Hudda, Global Sustainability Lead, Procurement, Mondelez International',
        descriptions: [
          {
            title: 'Upload & Save',
            description:
              'Upload and monitor production location portfolios received from suppliers.',
          },
          {
            title: 'Analyze & Monitor',
            description:
              "Identify areas at risk throughout your supply base and monitor compliance with EUDR and progress towards suppliers' zero-deforestation goals.",
          },
          {
            title: 'Collaborate',
            description:
              'Share portfolios and coordinate sourcing decisions across the organization. Integrate into due diligence processes for the EUDR.',
          },
          {
            title: 'Manage',
            description:
              'Identify areas for prioritization within your supply base to support zero-deforestation commitments.',
          },
        ],
      },
      // {
      //   title: 'Upload & Save',
      //   description: 'Upload and save thousands of your commodity sourcing and investment locations or select from locations provided by GFW.',
      //   role: '',
      //   quote: ''
      // }, {
      //   title: 'Analyze',
      //   description: "Use cutting edge forest-related insights from satellite imagery and GFW's vast data partner network to analyze issues and opportunities.",
      //   role: '',
      //   quote: ''
      // }, {
      //   title: 'Collaborate',
      //   description: 'Share secured data & insights with colleagues, suppliers, and customers through the platform.',
      //   role: '',
      //   quote: ''
      // }, {
      //   title: 'Decide',
      //   description: 'Prioritize locations for management actions to achieve internal policies or international commitments.',
      //   role: '',
      //   quote: ''
      // }
    ],
  },
  dataPartners: [
    'Our',
    'Data Partners',
    'ESRI',
    'Google',
    'University of Maryland',
    'IUCN',
    'WDPA',
    'NASA',
    'CartoDB',
    'USGS',
    'Transparent World',
    'Agrosatelite',
    'Ministry of Forestry Indonesia',
    'RSPO',
    'Guyra',
    'ESA',
    'UCLouvain',
    'UNEP-WCMC',
    'Geoscience Australia',
    'FUNAI Government of Canada',
    'Natural Resources Canada',
    'Earth Sciences Sector',
    'Geomatics Canada',
    'Ministry of Agriculture Republic of Congo',
    'El Observatorio del Desarrollo',
    'Universidad de Costa Rica',
    'LINZ',
    'COONAPIP',
    'Ministry of the Agriculture Indonesia',
    'IGBE',
    'INPE',
    'CIAT',
    'CGD',
    'Open Development Cambodia',
    'FoodReg',
  ],
};

export const columnHeaders = {
  alternativeMill: 'Alternative Mill Name',
  certification: 'Certification',
  certified: 'Certified',
  commodity: 'Commodity',
  company: 'Company',
  criticalHabitatProxy: 'Critical Habitat Proxy',
  deforestation: 'Deforestation',
  designation: 'Designation',
  designationType: 'Designation Type',
  fire: 'Fire',
  fires: 'Fires',
  forest: 'Forest',
  high: 'High',
  id: 'ID',
  indiginousPeoples: 'Indiginous Peoples',
  iucn: 'IUCN Category',
  locationName: 'Location Name',
  low: 'Low',
  mediumAbbr: 'Med',
  medium: 'Medium',
  millPriority: 'Mill Priority',
  naturalHabitatProxies: 'Natural Habitat Proxies',
  no: 'No',
  overall: 'Overall',
  parentCompany: 'Parent Company',
  peat: 'Peat',
  policyCategories: 'Policy Categories',
  primaryForest: 'Primary Forest',
  protectedAreas: 'Protected Areas',
  rspo: 'RSPO Certified',
  rspoModel: 'RSPO Model',
  siteId: 'Site ID',
  size: 'Size',
  sizeInHa: 'Size in ha',
  state: 'State',
  supplier: 'Supplier',
  supplierTwo: 'Supplier 2',
  threats: 'Threats',
  threatsAndValuesAbbr: 'T + V',
  threatsAndValues: 'Threats and Values',
  treeCoverExtent: 'Tree Cover Extent',
  treeCoverExtentInHa: 'Tree Cover Extent in ha',
  treeCoverLoss: 'Tree Cover Loss, all years',
  treeCoverLossInHa: 'Tree Cover Loss, all years in ha',
  total: 'Total',
  values: 'Values',
  yes: 'Yes',
};

export const dashboardPage = {
  infoBubbleConfig: {
    locationsAlertMap: 'locations_alert_map',
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

export const highchartColorsIndonesiaLegalClassification2020 = {
  'Converted Production Forest': '#fea189',
  'Limited Production Forest': '#c4fbaf',
  'Marine Protected Areas': '#ff00ff',
  'Other Utilization Area': '#d8d8d8',
  'Production Forest': '#fffeaa',
  'Protected Forest': '#00ff7b',
  'Sanctuary Reserves/Nature Conservation Area': '#c489fd',
};

export const diagnosticsStrings = {
  listOrLocationNotFound: 'List or location not found',
};

export const locationsPage = {
  templateDownloadSidebar: {
    initialPrompt: `<span>Download <a id="toggleUpload" href="" onclick="return false;">location upload templates</a>. For help, see our <a target="_blank" href=${GFW_PRO_USER_GUIDE}>how-to guide.</a></span>`,
    help: 'Help',
    header: 'Location templates',
    downloadPrompt:
      'Download, complete, and re-upload a template of less than 5MB and up to 1,500 locations to create a list.',
    downloadTypePrompt: 'Type',
    downloadButton: 'Download',
    howToGuideFooter: () =>
      `<span>View resources on our <a target="_blank" href=${GFW_PRO_HELP_CENTER__LINK}>Help Center</a>.</span>`,
  },
  updatedPalmOilMillUrl: 'https://gis-gfw.wri.org/arcgis/rest/services/commodities/MapServer/34',
  highchartSlugs: [
    'Indonesia-Legal-Classifications',
    'Land-Cover-Southeast-Asia',
    'Brazil-Biomes',
    'Indonesia-Land-Cover',
  ],
  highchartColorBackup: {
    'Protected area': '#44943e',
    'Limited production forest(HPT)': '#8dcc66',
    'Production forest(HP)': '#d4eaaf',
    'Convertible production forest(HPK)': '#dfa300',
    'Non-forest': '#fbfeb1',
    'Water bodies': '#94b5ff',
    'Bare land': '#d6d549',
    'Coastal fish pond': '#cfe6ff',
    'Rubber plantation': '#ebc963',
    Agriculture: '#ddb400',
    'Secondary forest': '#ddffac',
    'Grassland / shrub': '#fdffac',
    Mining: '#000000',
    'Mixed tree crops': '#ccaa57',
    'No data': '#d4cfbf',
    'Oil palm plantation': '#b35fc4',
    Settlements: '#f5babf',
    Swamp: '#7da19b',
    'Timber plantation': '#91773f',
    'Primary forest': '#8abc65',
    Amazônia: '#136400',
    Caatinga: '#49CC4C',
    Cerrado: '#9ECC49',
    'Mata Atlântica': '#5CA2D1',
    Pampa: '#63802E',
    Pantanal: '#0F3B82',
    'Body of water': '#94b5ff',
    'Estate crop plantation': '#b35fc4',
    'Fish pond': '#cfe6ff',
    'Grassland/shrub': '#fdffac',
    Settlement: '#f5babf',
  },
  infoBubbleConfig: {
    bannerHistoricSite: 'historic_site_characteristics',
    bannerListAttributes: 'fc_list_attributes',
    saLossOfForests: 'sensitive_areas_loss_annual',
    saHistoricAreasLoss: 'sensitive_areas_historic_loss',
    regionsSaAnnual: 'regions_sa_annual',
    regionsSaBiomes: 'regions_sa_biomes_calc',
    regionsProdesAnnual: 'regions_prodes_annual',
    regionsSoyAnnual: 'regions_soy_annual',
    regionsSoyCalc: 'regions_soy_calculations',
    regionsSeaAnnual: 'regions_sea_annual',
    regionsSeaLcCalc: 'regions_sea_land_cover_calc',
    regionsIdnLcCalc: 'regions_idn_land_cover_calc',
    regionsIdnLegal: 'regions_idn_legal_class_calc',
    regionsIdnForestM: 'regions_idn_forest_moratorium_calc',
    forestsVsPlantation: 'forests_vs_plantations_loss',
    plantationTypes: 'plantation_types',
    carbonEmissions: 'carbon_emissions_annual',
    trendsDeforestation: 'trends_in_deforestation',
    millPriorityHistory: 'mill_priority-history',
    crPalmRisk: 'cr_palm_risk_analysis',
    policyPA: 'policy_protected_areas',
    policyNaturalH: 'policy_natural_habitat_proxies',
    policyIndigP: 'policy_indigenous_peoples',
    policyFires: 'policy_fires',
    investmentLocations: 'investment_locations_map',
    carbonTCL: 'carbon_from_tree_cover_loss',
    portfolioTCL: 'portfolio_annual_tree_cover_loss',
    lossAllYears: 'loss_all_years',
    threats: 'threats',
    values: 'values',
    threatsAndValues: 'threats_and_values',
    treeCoverLossArgOtbnYearly: 'tree_cover_loss_arg_otbn_yearly',
    analysisOverview: 'deforestation_kpis_analysis_overview',
    landcoverCalc: 'deforestation_kpis_landcover_calc',
    naturalForestCoverage: 'deforestation_kpis_natural_forest_coverage',
    naturalForestLoss: 'deforestation_kpis_natural_forest_loss',
    negligibleRisk: 'deforestation_kpis_negligible_risk',
  },
  defaultFilterValues: {
    selectedCountry: '',
    selectedState: '',
    selectedSubState: '',
    selectedCompany: '',
    selectedAreaMin: 0,
    selectedAreaMax: null,
    selectedDesignationType: '',
    selectedDesignation: '',
    selectedNames: [],
    filterNames: '',
    selectedSupplier: '',
    selectedSecondSupplier: '',
    selectedParentCompany: '',
    selectedOverallThreats: [],
    selectedOverallValues: [],
    selectedMillPriority: [],
    showRSPOCertified: false,
    showTreeCoverExtent: false,
    showTreeCoverLoss: false,
    showTreeCoverLossPrimaryForest: false,
    showTreeCoverLossProtectedAreas: false,
    treeCoverExtentMin: 0,
    treeCoverExtentMax: 100,
    treeCoverLossMin: 0,
    treeCoverLossMax: 100,
    treeCoverLossPrimaryForestMin: 0,
    treeCoverLossPrimaryForestMax: 100,
    treeCoverLossProtectedAreasMin: 0,
    treeCoverLossProtectedAreasMax: 100,
    canopyDensity: 0,
    selectedStates: [],
    selectedSubStates: [],
    filterState: '',
    filterSubstate: '',
    filterStr: '',
  },
  tableKeyArray: [
    {
      templateDataValue: 'Investment',
      activeTemplate: 'investment',
    },
    {
      templateDataValue: 'Palm Oil Mill',
      activeTemplate: 'palmMill',
    },
    {
      templateDataValue: 'Palm Oil Plantation',
      activeTemplate: 'palmPlantation',
    },
    {
      templateDataValue: 'Palm Smallholder Farm',
      activeTemplate: 'palmFarm',
    },
    {
      templateDataValue: 'Palm Oil Generic',
      activeTemplate: 'palmGeneric',
    },
    {
      templateDataValue: 'Soy Silo',
      activeTemplate: 'soySilo',
    },
    {
      templateDataValue: 'Soy Farm',
      activeTemplate: 'soyFarm',
    },
    {
      templateDataValue: 'Soy Generic',
      activeTemplate: 'soyGeneric',
    },
    {
      templateDataValue: 'Beef Slaughterhouse',
      activeTemplate: 'beef',
    },
    {
      templateDataValue: 'Cattle Ranch',
      activeTemplate: 'cattle',
    },
    {
      templateDataValue: 'Cattle Generic',
      activeTemplate: 'cattleGeneric',
    },
    {
      templateDataValue: 'Cocoa Farm',
      activeTemplate: 'cocoa',
    },
    {
      templateDataValue: 'Cocoa Generic',
      activeTemplate: 'cocoaGeneric',
    },
    {
      templateDataValue: 'Other',
      activeTemplate: 'other',
    },
    {
      templateDataValue: 'Other',
      activeTemplate: 'generic',
    },
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
    submit: 'Submit For Analysis',
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
      'Note: only compatible locations can belong to the same list, i.e., same location classification, same location or commodity type and location template.',
    moveLocationsDialogHeader: 'Move selection',
    moveToNewListLabel: 'List name',
    moveToNewListDuplicate: 'A list with this name already exists',
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
      [saveAsDraftListConfig.success]: saveAsDraftListConfig.copyMoveMessagesLocationAddedAsDraft,
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
    tooltips: {
      working:
        'This list is being processed. Reload the page once the analysis is finished to access the results.',
      analyzing:
        'List is analyzing. You will receive an email once analysis is complete and can reload the page to access the results.',
      failed:
        'Analysis for this list has failed. Please return to the Locations page to re-process this list.',
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
    downloadFileInstructions:
      'Your list is too large for in-app editing. Download here to make changes to the desired location fields and reupload with the changes applied.',
    downloadFileTitle: 'Download to make changes to your list',
    dragAndDropTitle: 'Apply edits to your list',
    dragAndDropInstructions:
      'Drop your file here or click to upload the applied changes then click "Update" to finalize edits to your list.',
    wrongFormatMessage: 'Unsupported file type. File should be in csv format.',
    successTitle: 'Success!',
    successDescription: 'List updated successfully.',
    errorTitle: 'Failed',
    errorDescription: 'An error ocurred while updating the list.',
    cancel: 'Cancel',
    update: 'Update',
    close: 'Close',
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
  oversizedUploadText,
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
      large_list: {
        id: 'UploadLargeListLocations',
        header: 'Add a large list of locations',
        text: 'You can upload a list with up to 150,000 locations formatted to the Cocoa Generic template.',
      },
    },
    selectTemplateOptions: [
      {
        label: 'Investment (spreadsheet)',
        templateType: 'investment',
        templateName: `${aws_templates}InvestmentLocationTypeTemplate.xlsx`,
      },
      {
        label: 'Investment (point shapefile)',
        templateType: 'investment',
        templateName: `${aws_templates}investmentlocations_point.zip`,
      },
      {
        label: 'Investment (polygon shapefile)',
        templateType: 'investment',
        templateName: `${aws_templates}investmentlocations_polygon.zip`,
      },
      {
        label: 'Generic commodity (spreadsheet)',
        templateType: 'generic',
        templateName: `${aws_templates}CommoditiesGenericLocationTypeTemplate.xlsx`,
      },
      {
        label: 'Generic commodity (point shapefile)',
        templateType: 'generic',
        templateName: `${aws_templates}commodities_generic_point.zip`,
      },
      {
        label: 'Generic commodity (polygon shapefile)',
        templateType: 'generic',
        templateName: `${aws_templates}commodities_generic_polygon.zip`,
      },
      {
        label: 'Palm oil mill (spreadsheet)',
        templateType: 'palmMill',
        templateName: `${aws_templates}CommoditiesPalmOilMillLocationTypeTemplate.xlsx`,
      },
      {
        label: 'Palm oil plantation (spreadsheet)',
        templateType: 'palmPlantation',
        templateName: `${aws_templates}CommoditiesPalmOilPlantationLocationTypeTemplate.xlsx`,
      },
      {
        label: 'Palm smallholder farm (spreadsheet)',
        templateType: 'palmFarm',
        templateName: `${aws_templates}CommoditiesPalmSmallholderFarmLocationTypeTemplate.xlsx`,
      },
      {
        label: 'Palm smallholder farm (polygon shapefile)',
        templateType: 'palmFarm',
        templateName: `${aws_templates}palmoil_smallholder_polygon.zip`,
      },
      {
        label: 'Palm oil generic (spreadsheet)',
        templateType: 'palmGeneric',
        templateName: `${aws_templates}CommoditiesPalmOilGenericLocationTypeTemplate.xlsx`,
      },
      {
        label: 'Palm oil generic (point shapefile)',
        templateType: 'palmGeneric',
        templateName: `${aws_templates}palmoilgeneric_template_point.zip`,
      },
      {
        label: 'Palm oil generic (polygon shapefile)',
        templateType: 'palmGeneric',
        templateName: `${aws_templates}palmoilgeneric_template_polygon.zip`,
      },
      {
        label: 'Soy silo (spreadsheet)',
        templateType: 'soySilo',
        templateName: `${aws_templates}CommoditiesSoySiloLocationTypeTemplate.xlsx`,
      },
      {
        label: 'Soy silo (point shapefile)',
        templateType: 'soySilo',
        templateName: `${aws_templates}soy_silo_point.zip`,
      },
      {
        label: 'Soy farm (spreadsheet)',
        templateType: 'soyFarm',
        templateName: `${aws_templates}CommoditiesSoyFarmLocationTypeTemplate.xlsx`,
      },
      {
        label: 'Soy farm (polygon shapefile)',
        templateType: 'soyFarm',
        templateName: `${aws_templates}soy_farm_polygon.zip`,
      },
      {
        label: 'Soy generic (spreadsheet)',
        templateType: 'soyGeneric',
        templateName: `${aws_templates}CommoditiesSoyGenericLocationTypeTemplate.xlsx`,
      },
      {
        label: 'Soy generic (point shapefile)',
        templateType: 'soyGeneric',
        templateName: `${aws_templates}soygeneric_point.zip`,
      },
      {
        label: 'Soy generic (polygon shapefile)',
        templateType: 'soyGeneric',
        templateName: `${aws_templates}soygeneric_polygon.zip`,
      },
      {
        label: 'Beef slaughterhouse (spreadsheet)',
        templateType: 'beef',
        templateName: `${aws_templates}CommoditiesBeefSlaughterhouseLocationTypeTemplate.xlsx`,
      },
      {
        label: 'Beef slaughterhouse (point shapefile)',
        templateType: 'beef',
        templateName: `${aws_templates}beef_slaughterhouse_point.zip`,
      },
      {
        label: 'Beef slaughterhouse (polygon shapefile)',
        templateType: 'beef',
        templateName: `${aws_templates}beef_slaughterhouse_polygon.zip`,
      },
      {
        label: 'Cattle ranch (spreadsheet)',
        templateType: 'cattle',
        templateName: `${aws_templates}CommoditiesCattleRanchLocationTypeTemplate.xlsx`,
      },
      {
        label: 'Cattle ranch (polygon shapefile)',
        templateType: 'cattle',
        templateName: `${aws_templates}cattle_ranch_polygon.zip`,
      },
      {
        label: 'Cattle generic (spreadsheet)',
        templateType: 'cattleGeneric',
        templateName: `${aws_templates}CommoditiesCattleGenericLocationTypeTemplate.xlsx`,
      },
      {
        label: 'Cattle generic (point shapefile)',
        templateType: 'cattleGeneric',
        templateName: `${aws_templates}cattle_generic_point.zip`,
      },
      {
        label: 'Cattle generic (polygon shapefile)',
        templateType: 'cattleGeneric',
        templateName: `${aws_templates}cattle_generic_polygon.zip`,
      },
      {
        label: 'Cocoa farm (spreadsheet)',
        templateType: 'cocoa',
        templateName: `${aws_templates}CommoditiesCocoaFarmLocationTypeTemplate.xlsx`,
      },
      {
        label: 'Cocoa farm (polygon shapefile)',
        templateType: 'cocoa',
        templateName: `${aws_templates}cocoa_farm_polygon.zip`,
      },
      {
        label: 'Cocoa generic (spreadsheet)',
        templateType: 'cocoaGeneric',
        templateName: `${aws_templates}CommoditiesCocoaGenericLocationTypeTemplate.xlsx`,
      },
      {
        label: 'Cocoa generic (point shapefile)',
        templateType: 'cocoaGeneric',
        templateName: `${aws_templates}cocoa_generic_point.zip`,
      },
      {
        label: 'Cocoa generic (polygon shapefile)',
        templateType: 'cocoaGeneric',
        templateName: `${aws_templates}cocoa_generic_polygon.zip`,
      },
    ],
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
      cannotBeEditedInBrowser:
        'This column cannot be edited in the browser. Download the file to fix these errors, then re-upload above.',
      noLocationsSelected: {
        title: 'No locations selected',
        message: 'Select locations to upload.',
      },
      addTypeRequired: {
        title: 'You must select a type',
        message: 'Please pick a type (investment or commodity).',
      },
      commodityTypeRequired: {
        title: 'You must select a commodity type',
        message: 'Please pick a type.',
      },
      fileExtensionNotSupported: {
        title: 'File extension not supported',
        message: 'The supported file extensions are: csv, xlx, zip, kml, and kmz.',
      },
      otherCommodityTypeRequired: {
        title: 'You must provide a commodity',
        message: 'Please enter in the name of the commodity you are uploading.',
      },
      locationsNotValidated: {
        title: 'Locations not validated',
        message:
          'Please return to Step 3 and look for fields with validation errors. Hover the mouse over each field to see the error, and edit your locations to correct the issues before advancing to Step 4.',
      },
      notAllLocationsValid: {
        title: 'Are you sure?',
        message: ' from your upload will not be added to GFW Pro.',
      },
      endDateBeforeStartDate: {
        message: 'Please make sure Start Date is earlier than End Date',
      },
      missingEndDate: {
        message: 'Please make sure End Date is included',
      },
      missingStartDate: {
        message: 'Please make sure Start Date is included',
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
    submit: 'Submit For Analysis',
    upload: 'Upload File:',
    uploadError: 'Upload error',
    sizeOfInvestment: 'Size of Investment',
    timeframe: 'Review timeframe',
    timeframeDesc: 'Select start and end dates or time horizon for this location’s review period.',
    additionalMetadata: 'Additional metadata',
    startDate: 'Start Date',
    endDate: 'End Date',
    timeHorizonOptions: [
      { label: 'None', id: '' },
      { label: '3 months', id: '3 months' },
      { label: '6 months', id: '6 months' },
      { label: '1 year', id: '1 year' },
      { label: 'Custom timeframe', id: 'Time Horizon' },
    ],
    accuracyOptions: [
      { label: 'Very Confident', id: 'very' },
      { label: 'Moderately Confident', id: 'moderately' },
      { label: 'Not Confident', id: 'not' },
      { label: "Don't Know", id: 'idk' },
    ],
    attrTypes: [
      { label: 'Integer', id: 'int' },
      { label: 'Text', id: 'nvarchar(150)' },
      { label: 'Float', id: 'float' },
      { label: 'Date', id: 'nvarchar(150)' },
    ],
    protectedAreas: {
      localhost: 'Lz6YLHN1eyIwJNZDNp1IkFglwrO6qQfAwwRGz-KkyrPDyOjRgiP02tf7gQnD0sRy',
      'pro-staging.globalforestwatch.org':
        'P9JirtCtnVDKuuxWwOOzhkjXTZhYZOdOX2lx9ucHcY9bwMkxyvwIq9cm4o7BiH4Cajir0vspLArlORz21jEI7A..',
      'gfwpro.globalforestwatch.org':
        'W6ezC-46IViJqpkOg4WvhoLeqgc5XwCY6US2vChHuAf0tSffb4gNXBEkzRwVT5t3gMLrs3TRPUfspw-5Z-dxTQ..',
      'pro.globalforestwatch.org':
        'MCrBhmBWwyPefdQamP74oGxZkDeWMoeP5qSUlKkeYxMInNyuC7e2Sg_5Cz70d8UQU4Y5lEALv2dedpuGo5Dv3A..',
    },
    protectedServices: {
      localhost: 'Lz6YLHN1eyIwJNZDNp1IkFglwrO6qQfAwwRGz-KkyrPDyOjRgiP02tf7gQnD0sRy',
      'pro-staging.globalforestwatch.org':
        'P9JirtCtnVDKuuxWwOOzhkjXTZhYZOdOX2lx9ucHcY9bwMkxyvwIq9cm4o7BiH4Cajir0vspLArlORz21jEI7A..',
      'gfwpro.globalforestwatch.org':
        'W6ezC-46IViJqpkOg4WvhoLeqgc5XwCY6US2vChHuAf0tSffb4gNXBEkzRwVT5t3gMLrs3TRPUfspw-5Z-dxTQ..',
      'pro.globalforestwatch.org':
        'MCrBhmBWwyPefdQamP74oGxZkDeWMoeP5qSUlKkeYxMInNyuC7e2Sg_5Cz70d8UQU4Y5lEALv2dedpuGo5Dv3A..',
    },
    protectedAreasUrl:
      'https://gis-gfw.wri.org/arcgis/rest/services/cached/wdpa_protected_areas/MapServer',
    protectedServicesUrl:
      'https://gis-gfw.wri.org/arcgis/rest/services/protected_services/MapServer',
    accuracyDescription:
      'Please select one of the accuracy levels that best describes the commodity or investment locations',
    address: 'Address',
    additionalAttributes: 'Additional attributes',
    additionalAttributeLabel: 'Attribute ',
    optional: '(optional)',
    additionalFieldsNotSupported:
      'This template type does not allow for defining additional attributes.',
    additionalAttributesDescriptionSingle:
      'Add additional metadata tags to your templates before uploading.',
    additionalAttributesDescription:
      'If you used any “define your own attribute” columns in your template, add them here prior to uploading. Column names must match exactly: take note of special characters, spacing, and capitalization.',
    addToListTitle: 'List',
    addToListDesc:
      'Please note that only compatible locations can belong to the same list, i.e. same location classification, same commodity type and/or location template.',
    addToListInstructions: 'Add to existing',
    addToAnExistingList: 'Add to an existing list',
    createListInstructions: 'Create new',
    uploadWindText:
      'Please click if your file includes: wind barriers, riparian areas, and buffer zones',
    concessionTypes: [
      {
        name: 'Logging Concession',
        id: 'logging',
      },
      {
        name: 'Mining  Concession',
        id: 'mining',
      },
      {
        name: 'Palm Oil Concession',
        id: 'palmOil',
      },
      {
        name: 'Wood Fiber Concession',
        id: 'woodFiber',
      },
    ],
  },
  upload: {
    errors: {
      dataRead: 'Data Read Error',
      dataProjection: 'Data Projection Error',
      excelTitle: 'Excel parsing error',
      excelMessage: 'The Excel file parsed incorrectly. Please upload a valid file.',
      zipfile: 'Please fix the file and re-upload the correctly formatted template.',
      uploadErrorTile: 'Upload error occurred',
      uploadErrorDialogMessage: [
        'One or more of your locations failed to upload. Please follow the steps below:',
        '1. Please re-upload your locations, and on Step 3, search for "none" entries in the country, state, or sub-state fields. “None” entries occur when GFW Pro cannot identify a country, state, and sub-state for your uploaded locations.',
        '2. Check the following potential causes:',
        '• One or more of the failed locations may be on water. Please remove or correct those locations and re-upload your list.',
        '• If the issue above has been addressed, and your locations are on land, a system interruption may have occurred. Please re-upload your list.',
      ],
      uploadErrorDialogDownloadMessageTitle: 'Download error file',
    },
    maximumLocations: 'Maximum locations:',
    maximumFilesize: 'Maximum filesize:',
    filetypes: {
      title: 'Accepted filetypes:',
      csv: 'CSV or Excel file',
      zip: 'ZIP file containing a shapefile (SHP, DBF, SHX, and PRJ)',
      kml: 'KML or KMZ',
    },
    doneMessageDoNotChangeThis: 'Done',
    noValidDoNotChangeThis: 'No valid WRI_IDs',
    noValidDialogMessage: 'Please make sure your file contains rows with valid IDs.',
    locationsAddedDoNotChangeThis: 'Locations added',
    generatedHeaderFields: [
      'Commodity',
      'Accuracy Rating of Location Entered',
      'Location Classification',
      'Attribute1',
      'Attribute2',
      'Attribute3',
      'Country',
      'State',
      'Sub State',
      'Wind Barrier',
      'Riparian Buffers',
      'Buffer Zones',
      'gadmid',
    ],
    missingAddTypeError: 'You must select either investment or commodity type',
    stepSidebarLabels: ['Type', 'Additional attributes', 'Upload', 'Save'],
    stepOneTitle: 'Type',
    investmentAddType: 'Select this investment’s commodity type:',
    investmentAddTypeDescription:
      'Select for any investment in any commodity type. An investment list can contain multiple commodity types.',
    commodityAddType: 'Select commodity type:',
    commodityAddTypeDescription:
      'Select for any commodity supply chain location. Only one type of commodity can be uploaded per template.',
    stepTwoTitle: 'Add Multiple Locations',
    stepTwoStepCount: 'Step 2 of 4',
    stepThree: {
      title: 'Upload',
      finished: 'Finished',
      reupload: {
        drag: 'You can re-upload by dragging another file here',
        divider: 'or, ',
        chooseAFile: 'choose a file',
        fromYourComputer: 'from your computer.',
      },
      errorInstructions:
        'Errors in your locations appear below. Edit them directly in the browser or download and edit list, then re-upload.',
      download: 'Download',
      show: 'Show',
      locationsWithErrors: 'Locations with errors',
      locationsAll: 'All locations',
      locationsAllValidated: 'All locations validated',
    },
    stepFourTitle: 'Save',
    submit: 'Submit',
    submitForExisting: 'Submit For Analysis',
    successBanner:
      'New locations have been added. You will receive an email once analysis of the locations is complete, and can reload the page to access the data.',
    list: 'List',
    analysis: 'List Analyses',
    addToExisting: 'Add to existing',
    createNew: 'Create new',
    browse: 'Browse',
    protectedAreasPlaceholder: 'Search Protected Areas...',
    selectPlaceholder: 'Select…',
    uploadInstructions: 'Drag & drop file(s) here',
    inputDivider: 'or',
    templateOpen: 'CSV or Excel ',
    templateClose: ' File Template Format',
    ignoredInvestmentFields: [
      'Country',
      'State',
      'Sub State',
      'Wind Barrier',
      'Riparian Buffers',
      'Buffer Zones',
      'Investment Name',
      'Size of Investment',
      'CCY',
      'Monitoring Timeframe - Start Date',
      'Start Date',
      'End Date',
      'Monitoring Timeframe - End Date',
      'Time Horizon',
      'Accuracy Rating of Location Entered',
      'Latitude',
      'Longitude',
      'Analysis Area',
      'Analysis Radius',
      'gadmid',
    ],
    ignoredCommodityFields: [
      'Country',
      'State',
      'Sub State',
      'Wind Barrier',
      'Riparian Buffers',
      'Buffer Zones',
      'Location Name',
      'Monitoring Timeframe - Start Date',
      'Start Date',
      'End Date',
      'Monitoring Timeframe - End Date',
      'Time Horizon',
      'Accuracy Rating of Location Entered',
      'Latitude',
      'Longitude',
      'Analysis Area',
      'Analysis Radius',
      'gadmid',
    ],
    ignoredMultipleCommodityFields: [
      'Country',
      'State',
      'Sub State',
      'Wind Barrier',
      'Riparian Buffers',
      'Buffer Zones',
      'Accuracy Rating of Location Entered',
      'Latitude',
      'Longitude',
      'Analysis Area',
      'Analysis Radius',
      'gadmid',
    ],
    ignoredMultipleInvestmentFields: [
      'Country',
      'State',
      'Sub State',
      'Wind Barrier',
      'Riparian Buffers',
      'Buffer Zones',
      'Investment Size',
      'CCY',
      'Accuracy Rating of Location Entered',
      'Latitude',
      'Longitude',
      'Analysis Area',
      'Analysis Radius',
      'gadmid',
    ],
    templateOptions: {
      beef: {
        label: 'Beef Slaughterhouse',
        id: 'beef',
        group: 'cattle',
        fields: [
          {
            Tag: 'Commodity',
            mandatory: true,
            Value: 'Cattle (pre-selected and non-modifiable)',
          },
          {
            Tag: 'Location Classification',
            mandatory: true,
            Value:
              'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area',
          },
          {
            Tag: 'Volume (in megatonnes)',
            mandatory: false,
            Value: 'Volume of beef originating from the slaughterhouse in tons',
          },
          {
            Tag: 'Facility Code',
            mandatory: false,
            Value: 'Unique ID for slaughterhouses located within Brazil (i.e. SIF code)',
          },
          {
            Tag: 'Name of the Slaughterhouse',
            mandatory: false,
            Value: 'Name of the slaughterhouse',
          },
          {
            Tag: 'Slaughterhouse Contact',
            mandatory: false,
            Value: 'Name of the individual or contact person at the slaughterhouse',
          },
          {
            Tag: 'Additional Attribute 1',
            mandatory: false,
            Value: 'Additional Attribute 1 Value',
          },
          {
            Tag: 'Additional Attribute 2',
            mandatory: false,
            Value: 'Additional Attribute 2 Value',
          },
          {
            Tag: 'Additional Attribute 3',
            mandatory: false,
            Value: 'Additional Attribute 3 Value',
          },
        ],
      },
      cattle: {
        label: 'Cattle Ranch',
        id: 'cattle',
        group: 'cattle',
        fields: [
          {
            Tag: 'Commodity',
            mandatory: true,
            Value: 'Cattle (pre-selected and non-modifiable)',
          },
          {
            Tag: 'Location Classification',
            mandatory: true,
            Value:
              'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area',
          },
          {
            Tag: 'Volume (in megatonnes)',
            mandatory: false,
            Value: 'Volume of beef originating from the cattle ranch in megatons',
          },
          {
            Tag: 'Company ID',
            mandatory: false,
            Value: 'Unique ID assigned by your company to the ranch',
          },
          {
            Tag: 'Cadaster ID',
            mandatory: false,
            Value: 'Cadaster ID for ranches located within Brazil (i.e. CAR ID)',
          },
          {
            Tag: 'Owner Name',
            mandatory: false,
            Value: 'Name of the owner of the ranch',
          },
          {
            Tag: 'Owner ID',
            mandatory: false,
            Value:
              'National ID of the ranch owner - use CPF for Brazil, RUC for Paraguay, and CUIT for Argentina',
          },
          {
            Tag: 'Company Name',
            mandatory: false,
            Value: 'Company or subsidiary name of the ranch',
          },
          {
            Tag: 'Name of the Slaughterhouse',
            mandatory: false,
            Value: 'Associated or nearest slaughterhouse name',
          },
          {
            Tag: 'Code of the Slaughterhouse',
            mandatory: false,
            Value:
              'Unique ID for the associated slaughterhouse for slaughterhouses located within Brazil (i.e. SIF code)',
          },
          {
            Tag: 'Additional Attribute 1',
            mandatory: false,
            Value: 'Additional Attribute 1 Value',
          },
          {
            Tag: 'Additional Attribute 2',
            mandatory: false,
            Value: 'Additional Attribute 2 Value',
          },
          {
            Tag: 'Additional Attribute 3',
            mandatory: false,
            Value: 'Additional Attribute 3 Value',
          },
        ],
      },
      cattleGeneric: {
        label: 'Cattle Generic',
        id: 'cattleGeneric',
        group: 'cattle',
      },
      cocoa: {
        label: 'Cocoa Farm',
        id: 'cocoa',
        group: 'cocoa',
        fields: [
          {
            Tag: 'Commodity',
            mandatory: true,
            Value: 'Cocoa (not editable)',
          },
          {
            Tag: 'Location Classification',
            mandatory: true,
            Value:
              'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area',
          },
          {
            Tag: 'Company ID',
            mandatory: false,
            Value: 'Unique ID assigned by your company to the farm',
          },
          {
            Tag: 'Volume (in megatonnes)',
            mandatory: false,
            Value: 'Volume of cocoa beans originating from the farm in megatons',
          },
          {
            Tag: 'Owner Name',
            mandatory: false,
            Value: 'Name of the owner of the farm',
          },
          {
            Tag: 'Company Name',
            mandatory: false,
            Value: 'Company name associated with the point or polygon',
          },
          {
            Tag: 'Cooperative Name',
            mandatory: false,
            Value: 'Name of the cooperative the farm is associated with',
          },
          {
            Tag: 'Improvement Program',
            mandatory: false,
            Value:
              'Yes means this farm is part of some kind of improvement program; No means this farm is not part of any improvement program',
          },
          {
            Tag: 'Certification',
            mandatory: false,
            Value:
              'None means this farm is not certified against any standard; UTZ, Fairtrade, Rainforest Alliance, and Other Standard means this farm is certified according to the standard listed',
          },
          {
            Tag: 'Additional Attribute 1',
            mandatory: false,
            Value: 'Additional Attribute 1 Value',
          },
          {
            Tag: 'Additional Attribute 2',
            mandatory: false,
            Value: 'Additional Attribute 2 Value',
          },
          {
            Tag: 'Additional Attribute 3',
            mandatory: false,
            Value: 'Additional Attribute 3 Value',
          },
        ],
      },
      cocoaGeneric: {
        label: 'Cocoa Generic',
        id: 'cocoaGeneric',
        group: 'cocoa',
        fields: [],
      },
      palmMill: {
        label: 'Palm Oil Mill',
        id: 'palmMill',
        group: 'palmOil',
        fields: [
          {
            Tag: 'Commodity',
            mandatory: true,
            Value: 'Palm Oil (pre-selected and non-modifiable)',
          },
          {
            Tag: 'Location Classification',
            mandatory: true,
            Value:
              'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area',
          },
          {
            Tag: 'Company ID',
            mandatory: true,
            Value: "Unique ID assigned by user's company to the palm mill",
          },
          {
            Tag: 'ID',
            mandatory: true,
            Value: 'Unique WRI mill ID',
          },
          {
            Tag: 'Volume (in megatonnes)',
            mandatory: false,
            Value: 'Volume of palm oil originating from the mill in megatonnes',
          },
          {
            Tag: 'Group Name',
            mandatory: false,
            Value: 'Group name or RSPO membership name of the mill',
          },
          {
            Tag: 'Company Name',
            mandatory: false,
            Value: 'Company or subsidary name  of the mill',
          },
          {
            Tag: 'Supplier Name',
            mandatory: false,
            Value:
              'Supplier name (i.e. the name of the supplier this mill is associated with that user sources from - only applicable if user does not own the mill)',
          },
          {
            Tag: 'Refinery Name',
            mandatory: false,
            Value: 'Associated refinery name',
          },
          {
            Tag: 'Certification',
            mandatory: false,
            Value:
              'None means this mill is not certified against any standard; RSPO, ISPO, MSPO, SAN, ISCC, and Other Standard means this mill is certified according to the standard listed',
          },
          {
            Tag: 'Direct FFB',
            mandatory: false,
            Value: 'Percentage of FFB input into the mill from direct estates',
          },
          {
            Tag: 'Other FFB',
            mandatory: false,
            Value: 'Percentage of FFB input into the mill from third party estates',
          },
          {
            Tag: 'Other FFB',
            mandatory: false,
            Value: 'Percentage of FFB input into the mill from associated smallholders',
          },
          {
            Tag: 'Associated Smallholder FFB',
            mandatory: false,
            Value: 'sdf',
          },
          {
            Tag: 'Additional Attribute 1',
            mandatory: false,
            Value: 'Additional Attribute 1 Value',
          },
          {
            Tag: 'Additional Attribute 2',
            mandatory: false,
            Value: 'Additional Attribute 2 Value',
          },
          {
            Tag: 'Additional Attribute 3',
            mandatory: false,
            Value: 'Additional Attribute 3 Value',
          },
        ],
      },
      palmPlantation: {
        label: 'Palm Oil Plantation',
        id: 'palmPlantation',
        group: 'palmOil',
        fields: [
          {
            Tag: 'Commodity',
            mandatory: true,
            Value: 'Palm Oil (pre-selected and non-modifiable)',
          },
          {
            Tag: 'Location Classification',
            mandatory: true,
            Value:
              'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area',
          },
          {
            Tag: 'Company ID',
            mandatory: true,
            Value: "Unique ID assigned by user's company to the palm plantation or concession",
          },
          {
            Tag: 'ID',
            mandatory: true,
            Value: 'Unique WRI mill ID',
          },
          {
            Tag: 'Volume (in megatonnes)',
            mandatory: false,
            Value: 'Volume of palm oil originating from the plantation or concession in megatonnes',
          },
          {
            Tag: 'Group Name',
            mandatory: false,
            Value: 'Group name or RSPO membership name of the plantation or concession',
          },
          {
            Tag: 'Company Name',
            mandatory: false,
            Value: 'Company or subsidary name  of the plantation or concession',
          },
          {
            Tag: 'Supplier Name',
            mandatory: false,
            Value:
              'Supplier name (i.e. the name of the supplier this plantation or concession is associated with that user sources from - only applicable if user does not own the plantation or concession)',
          },
          {
            Tag: 'Facility Name',
            mandatory: false,
            Value: 'Associated mill name',
          },
          {
            Tag: 'Refinery Name',
            mandatory: false,
            Value: 'Associated refinery name',
          },
          {
            Tag: 'Certification',
            mandatory: false,
            Value:
              'None means this plantation or concession is not certified against any standard; RSPO, ISPO, MSPO, SAN, ISCC, and Other Standard means this plantation or concession is certified according to the standard listed',
          },
          {
            Tag: 'Additional Attribute 1',
            mandatory: false,
            Value: 'Additional Attribute 1 Value',
          },
          {
            Tag: 'Additional Attribute 2',
            mandatory: false,
            Value: 'Additional Attribute 2 Value',
          },
          {
            Tag: 'Additional Attribute 3',
            mandatory: false,
            Value: 'Additional Attribute 3 Value',
          },
        ],
      },
      palmFarm: {
        label: 'Palm Smallholder Farm',
        id: 'palmFarm',
        group: 'palmOil',
        fields: [
          {
            Tag: 'Commodity',
            mandatory: true,
            Value: 'Palm Oil (pre-selected and non-modifiable)',
          },
          {
            Tag: 'Location Classification',
            mandatory: true,
            Value:
              'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area',
          },
          {
            Tag: 'Company ID',
            mandatory: true,
            Value: "Unique ID assigned by user's company to the palm farm",
          },
          {
            Tag: 'Volume (in megatonnes)',
            mandatory: false,
            Value: 'Volume of palm oil originating from the farm in megatonnes',
          },
          {
            Tag: 'Supplier Name',
            mandatory: false,
            Value:
              'Supplier name (i.e. the name of the supplier this farm is associated with that user sources from - only applicable if user does not own the farm)',
          },
          {
            Tag: 'Facility Name',
            mandatory: false,
            Value: 'Associated mill name',
          },
          {
            Tag: 'Certification',
            mandatory: false,
            Value:
              'None means this farm is not certified against any standard; RSPO, ISPO, MSPO, SAN, ISCC, and Other Standard means this farm is certified according to the standard listed',
          },
          {
            Tag: 'Type of Smallholder',
            mandatory: false,
            Value: 'Type of smallholder (i.e. scheme/associated or independent)',
          },
          {
            Tag: 'Number of Smallholders',
            mandatory: false,
            Value: 'Number of smallholders producers associated with this farm',
          },
          {
            Tag: 'Additional Attribute 1',
            mandatory: false,
            Value: 'Additional Attribute 1 Value',
          },
          {
            Tag: 'Additional Attribute 2',
            mandatory: false,
            Value: 'Additional Attribute 2 Value',
          },
          {
            Tag: 'Additional Attribute 3',
            mandatory: false,
            Value: 'Additional Attribute 3 Value',
          },
        ],
      },
      palmGeneric: {
        label: 'Palm Oil Generic',
        id: 'palmGeneric',
        group: 'palmOil',
        fields: [],
      },
      pulp: {
        label: 'Pulp and Paper',
        id: 'pulpGeneric',
        group: 'pulp',
      },
      rubber: {
        label: 'Rubber',
        id: 'rubberGeneric',
        group: 'rubber',
      },
      soySilo: {
        label: 'Soy Silo',
        id: 'soySilo',
        group: 'soy',
        fields: [
          {
            Tag: 'Commodity',
            mandatory: true,
            Value: 'Soy (pre-selected and non-modifiable)',
          },
          {
            Tag: 'Location Classification',
            mandatory: true,
            Value:
              'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area',
          },
          {
            Tag: 'ID',
            mandatory: true,
            Value: 'Unique WRI facility ID',
          },
          {
            Tag: 'Volume (in megatonnes)',
            mandatory: false,
            Value: 'Volume of soy originating from the soy facility in megatonnes',
          },
          {
            Tag: 'National Facility Code',
            mandatory: false,
            Value:
              'National facility ID Code used within the country the facility is located within - use CDA for Brazil and ONCAA for Argentina',
          },
          {
            Tag: 'Facility Phone',
            mandatory: false,
            Value: 'Telephone number of the facility',
          },
          {
            Tag: 'Facility E-mail',
            mandatory: false,
            Value: 'Email of the facility',
          },
          {
            Tag: 'Facility Capacity',
            mandatory: false,
            Value: 'Capacity of the facility',
          },
          {
            Tag: 'Facility Type',
            mandatory: false,
            Value: 'Type of facility (i.e. silo, crusher, or port)',
          },
          {
            Tag: 'Facility Owner',
            mandatory: false,
            Value: 'Name of the owner of the facility',
          },
          {
            Tag: 'Business ID',
            mandatory: false,
            Value: 'Unique business ID for facilities located within Brazil (i.e. CNPJ ID',
          },
          {
            Tag: 'Certification',
            mandatory: false,
            Value:
              'None means this facility is not certified against any standard; RTRS, ISCC, AAPRESID, and Other Standard means this facility is certified according to the standard listed',
          },
          {
            Tag: 'Additional Attribute 1',
            mandatory: false,
            Value: 'Additional Attribute 1 Value',
          },
          {
            Tag: 'Additional Attribute 2',
            mandatory: false,
            Value: 'Additional Attribute 2 Value',
          },
          {
            Tag: 'Additional Attribute 3',
            mandatory: false,
            Value: 'Additional Attribute 3 Value',
          },
        ],
      },
      soyFarm: {
        label: 'Soy Farm',
        id: 'soyFarm',
        group: 'soy',
        fields: [
          {
            Tag: 'Commodity',
            mandatory: true,
            Value: 'Soy (pre-selected and non-modifiable)',
          },
          {
            Tag: 'Location Classification',
            mandatory: true,
            Value:
              'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area',
          },
          {
            Tag: 'Volume (in megatonnes)',
            mandatory: false,
            Value: 'Volume of soy originating from the soy farm in megatons',
          },
          {
            Tag: 'Company ID',
            mandatory: false,
            Value: 'Unique farm ID assigned by your company to the farm',
          },
          {
            Tag: 'Cadaster ID',
            mandatory: false,
            Value: 'Cadaster ID for farms located within Brazil (i.e. CAR __)',
          },
          {
            Tag: 'Owner Name',
            mandatory: false,
            Value: 'Name of the owner of the farm (also the contact person for the farm)',
          },
          {
            Tag: 'Owner ID',
            mandatory: false,
            Value:
              'National ID of the farm owner - use CPF for Brazil, RUC for Paraguay, and CUIT for Argentina',
          },
          {
            Tag: 'Company Name',
            mandatory: false,
            Value: 'Company or subsidiary name  of the farm',
          },
          {
            Tag: 'Company Contact',
            mandatory: false,
            Value: 'Name of the company contact person for the farm',
          },
          {
            Tag: 'Facility Name',
            mandatory: false,
            Value: 'Name of the facility (i.e. silo, crusher) associated with the farm',
          },
          {
            Tag: 'Certification',
            mandatory: false,
            Value:
              'None means this facility is not certified against any standard; RTRS, ISCC, AAPRESID, and Other Standard means this farm is certified according to the standard listed',
          },
          {
            Tag: 'Additional Attribute 1',
            mandatory: false,
            Value: 'Additional Attribute 1 Value',
          },
          {
            Tag: 'Additional Attribute 2',
            mandatory: false,
            Value: 'Additional Attribute 2 Value',
          },
          {
            Tag: 'Additional Attribute 3',
            mandatory: false,
            Value: 'Additional Attribute 3 Value',
          },
        ],
      },
      soyGeneric: {
        label: 'Soy Generic',
        id: 'soyGeneric',
        group: 'soy',
      },
      sugarCane: {
        label: 'Sugar Cane',
        id: 'sugarCaneGeneric',
        group: 'sugarCane',
      },
      other: {
        label: 'Other',
        id: 'other',
        group: 'other',
        fields: [
          {
            Tag: 'Commodity',
            mandatory: true,
            Value:
              'Cattle, cocoa, coffee, palm oil, rubber, pulp and paper, soy, sugar cane, other',
          },
          {
            Tag: 'Location Classification',
            mandatory: true,
            Value:
              'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area',
          },
          {
            Tag: 'ID (optional, only for Palm Oil)',
            mandatory: false,
            Value: 'Only displayed for Palm Oil, if Palm Oil Mill found',
          },
          {
            Tag: 'Volume (in megatonnes)',
            mandatory: false,
            Value: 'Volume of commodity originating from the point or polygon in megatons',
          },
          {
            Tag: 'Company ID',
            mandatory: false,
            Value: 'Unique ID assigned by your company to the point or polygon',
          },
          {
            Tag: 'Owner Name',
            mandatory: false,
            Value: 'Name of the owner of the point or polygon',
          },
          {
            Tag: 'Owner ID',
            mandatory: false,
            Value: 'Unique ID of the owner of the point or polygon',
          },
          {
            Tag: 'Company Name',
            mandatory: false,
            Value: 'Company name associated with the point or polygon',
          },
          {
            Tag: 'Group Name',
            mandatory: false,
            Value: 'Only displayed for Palm Oil, if Palm Oil Mill found',
          },
          {
            Tag: 'Supplier Name',
            mandatory: false,
            Value:
              'Supplier name (i.e. the name of the supplier this point or polygon is associated with that you source from - only applicable if you do not own the point)',
          },
          {
            Tag: 'Facility Name',
            mandatory: false,
            Value:
              "Name of the point's or polygon's associated processing facility (e.g. mill, crusher, grinder)",
          },
          {
            Tag: 'Refinery Name',
            mandatory: false,
            Value: "Name of the point's or polygon's associated refinery",
          },
          {
            Tag: 'Certification',
            mandatory: false,
            Value:
              'Yes means this point or polygon is certified; No means this point or polygon is not certified',
          },
          {
            Tag: 'Additional Attribute 1',
            mandatory: false,
            Value: 'Additional Attribute 1 Value',
          },
          {
            Tag: 'Additional Attribute 2',
            mandatory: false,
            Value: 'Additional Attribute 2 Value',
          },
          {
            Tag: 'Additional Attribute 3',
            mandatory: false,
            Value: 'Additional Attribute 3 Value',
          },
        ],
      },
    },
    investmentTemplate: {
      label: 'Other',
      id: 'other',
      fields: [
        {
          Tag: 'Commodity',
          mandatory: true,
          Value: 'Cattle, cocoa, coffee, palm oil, rubber, pulp and paper, soy, sugar cane, other',
        },
        {
          Tag: 'Company Policy Ranking (for cattle only)',
          mandatory: true,
          Value: 'A/B or C',
        },
        {
          Tag: 'Risk Level',
          mandatory: false,
          Value: 'High/Medium or Low',
        },
        {
          Tag: 'Counterparty',
          mandatory: false,
          Value: '',
        },
        {
          Tag: 'Parent Company or Group',
          mandatory: false,
          Value: '',
        },
        {
          Tag: 'Type of Investment',
          mandatory: false,
          Value: 'New Investment or Renewal',
        },
        {
          Tag: 'Certification',
          mandatory: false,
          Value:
            'NONE, RSPO, ISPO, MSPO, SAN, ISCC, RTRS, ISCC, AAPRESID, UTZ, Fairtrade, Rainforest Alliance, and Other Standard',
        },
      ],
    },
    stepThreeTitle: 'Validate Locations',
    stepThreeDescription:
      'Check GFW Pro’s automated validation and identify and fix errors in each column to continue with upload.',
    show: 'Show',
    showValidated: 'Validated',
    showNotValidated: 'Locations with Errors',
    showAllValidated: 'All',
    commodityTypeOptions: [
      {
        name: 'Cattle',
        id: 'cattle',
        commodityTemplate: 'cattleGeneric',
      },
      {
        name: 'Cocoa',
        id: 'cocoa',
        commodityTemplate: 'cocoaGeneric',
      },
      {
        name: 'Coffee',
        id: 'coffee',
        commodityTemplate: 'generic',
      },
      {
        name: 'Palm Oil',
        id: 'palmOil',
        commodityTemplate: 'palmGeneric',
      },
      {
        name: 'Pulp and Paper',
        id: 'pulp',
        commodityTemplate: 'generic',
      },
      {
        name: 'Rubber',
        id: 'rubber',
        commodityTemplate: 'generic',
      },
      {
        name: 'Soy',
        id: 'soy',
        commodityTemplate: 'soyGeneric',
      },
      {
        name: 'Sugar Cane',
        id: 'sugarCane',
        commodityTemplate: 'generic',
      },
      {
        name: 'Other',
        id: 'other',
        commodityTemplate: 'generic',
      },
      {
        name: 'Multiple',
        id: 'multiple',
      },
    ],
    tempFeatures: [
      {
        name: 'General Soy Area',
        lat: 16,
        lng: 22,
        analysisRadius: 44,
        analysisArea: 1000,
        commodity: 'soy',
        locationClass: 'property',
        companyId: 214,
        volume: 5000,
        ownerName: 'Michelle Tony',
        ownerId: 4461,
        companyName: 'Blue Raster',
        supplierName: 'Pepco',
        facilityName: 'Otter Facility',
        refineryName: 'Sea Refinery',
        certification: 'Yes',
        start: '3/13/2016',
        end: '3/22/2016',
        time: '1 year',
        accuracy: 'Very Confident',
      },
      {
        name: 'Soy Area 1!',
        lat: 16,
        lng: 22,
        analysisRadius: 44,
        analysisArea: 1000,
        commodity: 'soy',
        locationClass: 'property',
        companyId: 214,
        volume: 5000,
        ownerName: 'Lucas Cotner',
        ownerId: 4461,
        companyName: 'Blue Raster',
        supplierName: 'Pepco',
        facilityName: 'Otter Facility',
        refineryName: 'Sea Refinery',
        certification: 'Yes',
        start: '3/13/2016',
        end: '3/22/2016',
        time: '1 year',
        accuracy: 'Very Confident',
      },
      {
        name: 'Soy Area 2',
        lat: 16,
        lng: 22,
        analysisRadius: 44,
        analysisArea: 1000,
        commodity: 'soy',
        locationClass: 'property',
        companyId: 214,
        volume: 5000,
        ownerName: 'Adnan Bilwani',
        ownerId: 4461,
        companyName: 'Blue Raster',
        supplierName: 'Pepco',
        facilityName: 'Otter Facility',
        refineryName: 'Sea Refinery',
        certification: 'Yes',
        start: '3/13/2016',
        end: '3/22/2016',
        time: '1 year',
        accuracy: 'Very Confident',
      },
    ],
    headerFields: [
      {
        Tag: 'Location Name',
        validation: '',
      },
      {
        Tag: 'Latitude',
        validation: '',
      },
      {
        Tag: 'Longitude',
        validation: '',
      },
      {
        Tag: 'Analysis Radius (km)',
        validation: '',
      },
      {
        Tag: 'Analysis Area (ha)',
        validation: '',
      },
      {
        Tag: 'Commodity',
        validation: '',
      },
      {
        Tag: 'Location Classification',
        validation: '',
      },
      {
        Tag: 'Company ID',
        validation: '',
      },
      {
        Tag: 'Volume (in megatonnes)',
        validation: '',
      },
      {
        Tag: 'Owner Name',
        validation: '',
      },
      {
        Tag: 'Owner ID',
        validation: '',
      },
      {
        Tag: 'Company Name',
        validation: '',
      },
      {
        Tag: 'Supplier Name',
        validation: '',
      },
      {
        Tag: 'Facility Name',
        validation: '',
      },
      {
        Tag: 'Refinery Name',
        validation: '',
      },
      {
        Tag: 'Certification',
        validation: '',
      },
      {
        Tag: 'Start Date',
        validation: '',
      },
      {
        Tag: 'End Date',
        validation: '',
      },
      {
        Tag: 'Time Horizon',
        validation: '',
      },
      {
        Tag: 'Accuracy Rating of Location Entered',
        validation: '',
      },
    ],
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
    userProfileTitle: 'User profile',
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
    b2bSection: {
      b2bCommingSoonTitle: 'B2B sharing trial coming soon!',
      b2bCommingSoonDescription1:
        'Business-to-business (B2B) sharing is a forthcoming GFW Pro feature that will allow users to share lists between organizations via established secure connections. Reach out to',
      b2bCommingSoonDescription2: 'to sign up for a B2B sharing trial.',
      b2bConnections: 'B2B Connections',
      connect: 'Connect',
      connectDescription: 'Connections allow you to share your lists between companies.',
      sendInvitationDescription:
        'Insert the e-mail address of the user you would like to connect with below',
      invitationSent: 'Invitation sent!',
      createANewConnection: 'Create a new connection',
      invitationSentDescription: (receiverEmail, receiverCompanyName) =>
        `You have successfully sent a connection request to <b>${receiverEmail}</b> from <b>${receiverCompanyName}</b>. You will be notified when this organization accepts your B2B connection request.`,
      email: 'E-mail',
      organizationName: 'Organization Name',
      name: 'Name',
      accountManagerInformation: 'Account Manager Information',
      status: 'Status',
      sendInvitation: 'Send',
      ok: 'Ok',
      cancel: 'Cancel',
      cancelConnection: 'Cancel Connection',
      close: 'Close',
      searchB2BConnections: 'Search B2B Connections',
      searchDescription: 'Search by organization name, country or address...',
      createNewB2bConnection: 'New Connection',
      removeAll: 'Remove All',
      pending: 'Pending',
      resend: 'Resend',
      reject: 'Reject',
      removeConnection: 'Remove connection',
      requestExpired: 'Request Expired',
      termsOfUseWarning:
        'By using this feature, you agree with the <a href="/terms-of-use">Terms of Use </a>.',
      connectionAlreadyExists: 'This connection already exists!',
      connectionAlreadyExistsDescription:
        'You already have a connection with this organization. To manage or remove connections, navigate to the B2B page.',
      notAdministrator: 'User does not have required permission',
      notAdministratorDescription:
        'The e-mail address entered does not belong to an account with administrator.',
      userNotFound: 'GFW Pro user not found',
      userNotFoundDescription: 'The e-mail address does not belong to GFW Pro account.',
      tryAgain: 'Try again',
      withAnAdministratorEmail: 'with an administrator e-mail.',
      multipleAccountsMessage: 'Select one account',
      multipleAccountsDescription: 'This email has more than 1 account. Select one below.',
      emailAndOrgNotMatchingError: 'Your e-mail or organization name does not match. Try again.',
      details: 'DETAILS',
    },
  },
  accountUsage: {
    title:
      'Analytics usage for subscription year ({subscriptionYearStart} to {subscriptionYearEnd})',
    locationsAnalyzed: '# of Analyses',
    areaAnalyzed: 'Area analyzed (HA)',
  },
};

export const PLANET_TILE_LAYER_INITIAL = 'planet_medres_normalized_analytic_2020-10_mosaic';

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
  downloadLinks: {
    [proLayers.treeCoverLossID]:
      'https://earthenginepartners.appspot.com/science-2013-global-forest',
    [proLayers.treeCoverGainID]:
      'https://earthenginepartners.appspot.com/science-2013-global-forest',
    [proLayers.prodesDeforestationID]:
      'http://www.obt.inpe.br/OBT/assuntos/programas/amazonia/prodes',
    [proLayers.treeBiomassLossID]:
      'https://data.globalforestwatch.org/datasets/d33587b6aee248faa2f388aaac96f92c_0',
    [proLayers.gladAlertsID]: 'http://glad-forest-alert.appspot.com/',
    [proLayers.viirsActiveFiresID]:
      'https://earthdata.nasa.gov/earth-observation-data/near-real-time/firms/active-fire-data',
  },
  uploadLabel: 'CLICK TO PICK A FILE OR DROP ONE HERE',
  otherSteps: [
    'Use the tabs above the map to turn on a data layer',
    'Select a shape in the map',
    'Click “Analyze” or “Subscribe”',
  ],
  // gfw_api_layers_url: 'https://staging-api.globalforestwatch.org/v1/layer?app=gfw-pro&page[size]=1000',

  gfw_production_layers_url:
    'https://production-api.globalforestwatch.org/v1/layer?app=gfw-pro&page[size]=1000&env=production',
  gfw_staging_layers_url: `https://production-api.globalforestwatch.org/v1/layer?app=gfw-pro&page[size]=1000&t=${Date.now()}&env=staging`,
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
  densityLossStart: 'Displaying loss with ',
  densityLossEnd: ' canopy density.',
  layerWarnings: [
    {
      id: proLayers.treeCoverLossID,
      title: 'Tree cover loss is not always deforestation',
      content:
        '<p class="basemap-modal-title">Tree cover loss is not always deforestation.</p><p>Loss of tree cover may occur for many reasons, including deforestation, fire, and ' +
        'logging within the course of sustainable forestry operations. In sustainably managed forests, ' +
        'the “loss” will eventually show up as “gain”, as young trees get large enough to achieve canopy closure.</p>',
    },
  ],

  basemaps: [
    {
      id: 'custom-default',
      label: 'Default',
      customVectorUrl: `${pro_AWS_base}/basemaps/basemap-default.json`,
      // customVectorUrl: 'https://gist.githubusercontent.com/apatterson0617/839b5fa4605afe9153c7a4405032c949/raw/a6d347df7c20cdb8bb60ed480641bf84a0672b5c/basemap-default.json',
      default: true,
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
      id: 'dark-matter',
      label: 'Dark Matter',
      customUrl: 'http://a.basemaps.cartocdn.com/dark_nolabels/{level}/{col}/{row}.png', // TODO: Over https when its available!
      content:
        '<div class="basemap-modal-title">Dark Matter</div><p>Dark Matter is a base map developed by <a href="http://cartodb.com/attributions#basemaps" target="_blank">CartoDB</a>, with <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a>, and <a href="http://www.naturalearthdata.com/" target="_blank">natural earth</a> data.</p>',
    },
    {
      id: 'positron',
      label: 'Positron',
      customUrl: 'http://a.basemaps.cartocdn.com/light_nolabels/{level}/{col}/{row}.png', // TODO: Over https when its available!
      content:
        '<div class="basemap-modal-title">Positron</div><p>Positron is a base map developed by <a href="http://cartodb.com/attributions#basemaps" target="_blank">CartoDB</a>, with <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a>, and <a href="http://www.naturalearthdata.com/" target="_blank">natural earth</a> data.</p>',
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

/*
  Templates corresponding to template_id numbers:
  1 Investment
  2 Palm Oil Mill
  3 Palm Oil Plantation
  4 Palm Smallholder Farm
  5 Palm Oil Generic
  6 Soy Silo
  7 Soy Farm
  8 Soy Generic
  9 Beef Slaughterhouse
  10 Cattle Ranch
  11 Cattle Generic
  12 Cocoa Farm
  13 Cocoa Generic
  14 Other
*/

/**
 * Templates for Excel file that have column 'Location Classification' Mandatory
 * checkLocationClassificationValidity([locations], templateDescription)
 * @type {string[]}
 */
export const excelLocationClassificationMandatory = [
  'Cattle Generic',
  'Cocoa Generic',
  'Palm Oil Generic',
  'Pulp and Paper',
  'Rubber',
  'Soy Generic',
  'Sugar Cane',
  'Generic',
  'Other',
];

/**
 * Excluded Excel templates that don't need 'Location Classification' field populated
 * @type {string[]}
 */
export const excelLocationClassificationExcluded = [
  'Investment',
  'Palm Oil Mill',
  'Beef Slaughterhouse',
  'Cattle Ranch',
  'Cocoa Farm',
  'Palm Oil Mill',
  'Palm Oil Plantation',
  'Palm Smallholder Farm',
  'Soy Silo',
  'Soy Farm',
];

export const authMessages = {
  resetLimit: {
    title: 'Too many reset attempts',
    message: 'Please try again in 15 minutes',
  },
  passwordExpired: {
    title: 'Password has expired',
    message: 'Please check your email for a new temporary password',
  },
  forgotFailed: {
    title: 'Error',
    message: 'Forgot password change did not work',
  },
  internalError: {
    title: 'Failure',
    message: 'Something internal failed',
  },
  resetSuccess: {
    title: 'Success',
    message: 'Password has been reset',
  },
  resetError: {
    title: 'Error',
    message: 'Error resetting password',
  },
  noUser: {
    title: 'User not found',
    message: 'Please check and try again',
  },
};

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
  },
  accountUsageLabels: {
    organizationName: 'Organization Name',
    numberOfLists: 'Number of lists',
    maxAreaPerList: 'Max area per list',
    totalAreaAnalyzed: 'Total area analyzed',
    locationsAnalyzed: 'Locations analyzed',
  },
  accountFormLabels: {
    org_name: 'Organization Name',
    org_address: 'Organization Address',
    org_website: 'Organization Website',
    parent_org_name: 'Parent Organization',
    is_subsidiary: 'Is Subsidiary ?',
    arr_org_classification: 'Account Classifications',
    arr_org_policy: 'Organization Policy',
    subscription_status_id: 'Subscription Status',
  },
  accountLimitsSetting: {
    locationsPerYear: 'Locations Per Year',
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
  areaPerYear: 'Area Per Year',
};

export const featureFlagsStrings = {
  pageHeading: 'Features',
  addCompanyDialogTitle: 'Select Organization',
};
