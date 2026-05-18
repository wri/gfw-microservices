import { proLayers } from '../proLayers.config';

// Dataset Version Constants
// Update these versions when new datasets are released
const DATASET_VERSIONS = {
  ARG_NATIVE_FOREST: 'v202212',
  CLARK_LABS_AQUACULTURE_2018: 'v202203',
  CLARK_LABS_AQUACULTURE_CHANGE: 'v202203',
  GFW_INDIGENOUS_LANDS: 'v202408',
  GFW_UNIVERSAL_MILL_LIST: 'v202508',
  GFW_WEST_AFRICA_COCOA: 'v202312',
  IDN_FOREST_AREA: 'v201709',
  IDN_LAND_COVER_2017: 'v201807',
  INPE_PRODES: 'v202507',
  GFWPRO_NEGLIGIBLE_RISK: 'v20260417',
  NASA_VIIRS_FIRE_ALERTS: 'v202010',
  UMD_GLAD_DIST_ALERTS: 'v202412',
  WDPA_PROTECTED_AREAS: 'v202602',
};

// Pre-built Dataset URLs
const DATASET_URLS = {
  // Argentina Native Forest
  ARG_FOREST_TILES: `https://tiles.globalforestwatch.org/arg_native_forest_land_plan/${DATASET_VERSIONS.ARG_NATIVE_FOREST}/default/{z}/{x}/{y}.png`,
  // Clark Labs Aquaculture
  AQUACULTURE_2018_TILES: `https://tiles.globalforestwatch.org/clark_labs_tropical_pond_aquaculture_2018/${DATASET_VERSIONS.CLARK_LABS_AQUACULTURE_2018}/default/{z}/{x}/{y}.png`,
  AQUACULTURE_CHANGE_TILES: `https://tiles.globalforestwatch.org/clark_labs_tropical_pond_aquaculture_change_1999_2018/${DATASET_VERSIONS.CLARK_LABS_AQUACULTURE_CHANGE}/default/{z}/{x}/{y}.png`,
  // Indonesia Forest Area
  IDN_FOREST_API: `https://data-api.globalforestwatch.org/dataset/idn_forest_area/${DATASET_VERSIONS.IDN_FOREST_AREA}/features`,
  IDN_FOREST_TILES: `https://tiles.globalforestwatch.org/idn_forest_area/${DATASET_VERSIONS.IDN_FOREST_AREA}/default/root.json`,
  // Indonesia Land Cover
  IDN_LAND_COVER_TILES: `https://tiles.globalforestwatch.org/idn_land_cover_2017/${DATASET_VERSIONS.IDN_LAND_COVER_2017}/default/{z}/{x}/{y}.png`,
  // Indigenous & Community Lands
  INDIGENOUS_LANDS_API: `https://data-api.globalforestwatch.org/dataset/gfw_indigenous_community_and_indicative_lands/${DATASET_VERSIONS.GFW_INDIGENOUS_LANDS}/features`,
  INDIGENOUS_LANDS_TILES: `https://tiles.globalforestwatch.org/gfw_indigenous_community_and_indicative_lands/${DATASET_VERSIONS.GFW_INDIGENOUS_LANDS}/default/root.json`,
  // INPE PRODES
  INPE_PRODES_TILES: `https://tiles.globalforestwatch.org/inpe_prodes/${DATASET_VERSIONS.INPE_PRODES}/default/root.json`,
  // Negligible Risk Analysis
  NEGLIGIBLE_RISK_TILES: `https://tiles.globalforestwatch.org/gfwpro_negligible_risk_analysis/${DATASET_VERSIONS.GFWPRO_NEGLIGIBLE_RISK}/default/root.json`,
  // NASA VIIRS Fire Alerts
  NASA_VIIRS_API: `https://data-api.globalforestwatch.org/dataset/nasa_viirs_fire_alerts/${DATASET_VERSIONS.NASA_VIIRS_FIRE_ALERTS}/features`,
  // UMD GLAD Dist Alerts
  UMD_GLAD_TILES: `https://tiles.globalforestwatch.org/umd_glad_dist_alerts_coverage/${DATASET_VERSIONS.UMD_GLAD_DIST_ALERTS}/default/root.json`,
  // Universal Mill List
  UNIVERSAL_MILL_LIST_TILES: `https://tiles.globalforestwatch.org/gfw_universal_mill_list/${DATASET_VERSIONS.GFW_UNIVERSAL_MILL_LIST}/default/root.json`,
  // West Africa Cocoa
  WEST_AFRICA_COCOA_TILES: `https://tiles.globalforestwatch.org/gfw_west_africa_cocoa_deforestation_risk/${DATASET_VERSIONS.GFW_WEST_AFRICA_COCOA}/default/{z}/{x}/{y}.png`,
  // WDPA Protected Areas
  WDPA_API: `https://data-api.globalforestwatch.org/dataset/wdpa_licensed_protected_areas/${DATASET_VERSIONS.WDPA_PROTECTED_AREAS}/features`,
  WDPA_TILES: `https://tiles.globalforestwatch.org/wdpa_licensed_protected_areas/${DATASET_VERSIONS.WDPA_PROTECTED_AREAS}/default/root.json`,
};

export const mapLayers = [
  {
    id: '10750e07-583b-41bb-a46e-ee2f256db7ff',
    type: 'layer',
    attributes: {
      name: 'Indonesia Forest Area',
      slug: 'Indonesia-Legal-Classifications_1',
      dataset: '74488909-5d8f-45aa-a790-0ba98bc71139',
      application: ['gfw-pro'],
      iso: [],
      provider: 'featureservice',
      userId: '5c533e5cc3b3242d2ed73bc7',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/10750e07-583b-41bb-a46e-ee2f256db7ff-1691677010565.png',
      env: 'production',
      layerConfig: {
        type: 'Vector.Layer',
        body: {
          useCors: true,
          metadata: 'idn_forest_area',
          url: DATASET_URLS.IDN_FOREST_TILES,
        },
      },
      legendConfig: {
        type: 'basic',
        items: [
          {
            color: '#c6a541',
            categories: [
              {
                color: '#C489FD',
                name: 'Sanctuary reserve/nature conservation area',
              },
              {
                color: '#FF00FF',
                name: 'Marine protected area',
              },
              {
                color: '#00FF7B',
                name: 'Protected forest',
              },
              {
                color: '#C4FBAF',
                name: 'Limited production forest',
              },
              {
                color: '#FFFEAA',
                name: 'Production forest',
              },
              {
                color: '#FEA189',
                name: 'Convertible production forest',
              },
              {
                color: '#D8D8D8',
                name: 'Other utilization area',
              },
            ],
            name: 'Indonesia Forest Area',
          },
        ],
      },
      interactionConfig: {
        type: 'info',
        config: {
          url: DATASET_URLS.IDN_FOREST_API,
        },
      },
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2020-12-04T21:06:36.597Z',
      updatedAt: '2023-08-10T14:16:50.489Z',
    },
  },
  {
    id: 'b0b0b73a-1d9e-4259-9dec-8fb1b0f207e0',
    type: 'layer',
    attributes: {
      name: proLayers.integratedAlertsGeographicCoverageID,
      slug: 'umd-glad-landsat-alerts-coverage',
      dataset: 'e663eb09-04de-4f39-b871-35c6c2ed10b5',
      description: proLayers.integratedAlertsGeographicCoverageID,
      application: ['gfw-pro'],
      iso: [],
      provider: 'leaflet',
      userId: '62601518cdc846001a7756b5',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/b0b0b73a-1d9e-4259-9dec-8fb1b0f207e0-1702307467296.png',
      env: 'production',
      layerConfig: {
        type: 'Vector.Layer',
        body: {
          options: {
            color: [220, 102, 153],
          },
          'coverage-options': {
            opacity: 0.3,
            color: '#f69',
          },
          'css-url':
            'https://github.com/Vizzuality/gfw/blob/develop/app/assets/javascripts/map/cartocss/style.cartocss',
          url: 'https://tiles.globalforestwatch.org/umd_glad_landsat_alerts_coverage/v2014/default/root.json',
          useCors: true,
          metadata: 'umd_landsat_alerts',
        },
      },
      legendConfig: {
        items: [
          {
            categories: [
              {
                name: 'Geographic coverage',
                color: '#f69',
              },
            ],
            name: 'Landsat Integrated Alerts Geographic Coverage',
            source: '(weekly, 30m, select countries, UMD/GLAD)',
            color: '#dc6699',
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2023-11-28T21:44:34.848Z',
      updatedAt: '2023-12-11T15:11:07.233Z',
    },
  },
  {
    id: '0910569c-2c4f-42cd-bef3-7e212b1f1061',
    type: 'layer',
    attributes: {
      name: 'Land Rights (Esri)',
      slug: 'Land-Rights-Esri',
      dataset: '503f3a73-ceb1-4b5c-b64b-bb3c72c81da1',
      description: 'Land Rights (Esri)',
      application: ['gfw-pro'],
      iso: [],
      provider: 'esrivectorservice',
      type: 'layer',
      userId: '596cde70824315350dd0f116',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/0910569c-2c4f-42cd-bef3-7e212b1f1061-1701273943313.png',
      env: 'production',
      layerConfig: {
        type: 'Vector.Layer',
        body: {
          useCors: true,
          metadata: 'landmark_icls_2020',
          url: DATASET_URLS.INDIGENOUS_LANDS_TILES,
        },
      },
      legendConfig: {
        type: 'basic',
        items: [
          {
            name: 'Indigenous and Community Lands',
            source: 'LandMark',
            categories: [
              {
                name: 'Indigenous Lands - Acknowledged by Government',
                color: '#bf6938',
              },
              {
                name: 'Indigenous Lands - Not acknowledged by Government',
                color: '#f3aa72',
              },
              {
                name: 'Community Lands - Acknowledged by Government',
                color: '#2c5682',
              },
              {
                name: 'Community Lands - Not acknowledged by Government',
                color: '#407ebe',
              },
              {
                name: 'Indicative Areas of Indigenous and Community Land Rights',
                color: '#9c9c9c',
              },
            ],
          },
        ],
      },
      interactionConfig: {
        type: 'info',
        config: {
          url: DATASET_URLS.INDIGENOUS_LANDS_API,
        },
      },
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2020-05-19T18:58:43.029Z',
      updatedAt: '2023-11-29T16:05:43.244Z',
    },
  },
  {
    id: '62bd1e7f-3fd7-4622-808c-733730bc25bd',
    type: 'layer',
    attributes: {
      name: proLayers.prodesDeforestationVizzBrazil,
      slug: 'PRODES-Deforestation-Vizz-Brazil_1',
      dataset: 'ae3275ec-6334-46b8-8904-4000cec04f50',
      application: ['gfw-pro'],
      iso: [],
      provider: 'featureservice',
      userId: '5c533e5cc3b3242d2ed73bc7',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/62bd1e7f-3fd7-4622-808c-733730bc25bd-1651767012784.png',
      env: 'production',
      layerConfig: {
        type: 'Vector.Layer',
        body: {
          useCors: true,
          metadata: 'prodes',
          url: DATASET_URLS.INPE_PRODES_TILES,
        },
      },
      legendConfig: {
        type: 'basic',
        items: [
          {
            name: 'PRODES deforestation',
            source: '(annual, 30m, Brazilian Amazon, INPE)',
            color: '#ff6699',
          },
        ],
      },
      interactionConfig: {
        type: 'info',
        config: {
          url: 'https://data-api.globalforestwatch.org/dataset/inpe_amazonia_prodes/latest/features',
        },
      },
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2021-01-04T14:55:58.412Z',
      updatedAt: '2022-05-05T16:10:12.702Z',
    },
  },
  {
    id: '9a83a805-6b08-4275-86bb-5ae4b82303a5',
    type: 'layer',
    attributes: {
      name: 'GLAD-L alerts',
      slug: 'glad-alerts_1_1',
      dataset: 'e663eb09-04de-4f39-b871-35c6c2ed10b5',
      description: 'GLAD-L alerts',
      application: ['gfw-pro'],
      iso: [],
      provider: 'leaflet',
      userId: '62601518cdc846001a7756b5',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/9a83a805-6b08-4275-86bb-5ae4b82303a5-1718114473468.png',
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          options: {
            color: [220, 102, 153],
          },
          'coverage-options': {
            opacity: 0.3,
            color: '#f69',
          },
          'css-url':
            'https://github.com/Vizzuality/gfw/blob/develop/app/assets/javascripts/map/cartocss/style.cartocss',
          url: 'https://tiles.globalforestwatch.org/umd_glad_landsat_alerts/latest/default/{z}/{x}/{y}.png',
          useCors: true,
          metadata: 'umd_landsat_alerts',
        },
      },
      legendConfig: {
        items: [
          {
            categories: [
              {
                name: 'Recent alerts',
                color: '#e4c600',
              },
              {
                name: 'Show only confirmed alerts',
                color: '#d7668f',
              },
              {
                name: 'Geographic coverage',
                color: '#f69',
              },
            ],
            name: 'GLAD-L alerts',
            source: '(weekly, 30m, select countries, UMD/GLAD)',
            color: '#dc6699',
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2022-06-23T14:24:13.370Z',
      updatedAt: '2024-06-11T14:01:13.382Z',
    },
  },
  {
    id: 'f16ba7ea-720e-4bc0-904e-fb340316e3c6',
    type: 'layer',
    attributes: {
      name: 'RSPO Concessions',
      slug: 'RSPO-Concessions_1',
      dataset: '953b91b1-3fb1-42a1-95ac-0518148f4ad9',
      description: 'RSPO Concessions',
      application: ['gfw-pro'],
      iso: [],
      provider: 'featureservice',
      userId: '5c533e5cc3b3242d2ed73bc7',
      default: true,
      protected: false,
      published: true,
      env: 'production',
      layerConfig: {
        type: 'Vector.Layer',
        body: {
          useCors: true,
          metadata: 'rspo_oil_palm_2019',
          url: 'https://tiles.globalforestwatch.org/rspo_oil_palm/v20200114/default/root.json',
        },
      },
      legendConfig: {
        type: 'basic',
        items: [
          {
            name: 'RSPO oil palm concessions',
            color: '#e5ea00',
          },
        ],
      },
      interactionConfig: {
        type: 'info',
        config: {
          url: 'https://data-api.globalforestwatch.org/dataset/rspo_oil_palm/latest/features',
        },
      },
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2020-11-22T01:41:57.357Z',
      updatedAt: '2021-03-29T14:44:30.130Z',
    },
  },
  {
    id: 'de77d217-0194-46c5-bb0b-a8c7f5a32a00',
    type: 'layer',
    attributes: {
      name: 'Oil Palm Concessions',
      slug: 'Oil-Palm-Concessions_1',
      dataset: '4d75cc46-455e-45e6-97f0-95d56549c15e',
      description: 'Oil Palm Concessions',
      application: ['gfw-pro'],
      iso: [],
      provider: 'featureservice',
      userId: '5c533e5cc3b3242d2ed73bc7',
      default: true,
      protected: false,
      published: true,
      env: 'production',
      layerConfig: {
        type: 'Vector.Layer',
        body: {
          useCors: true,
          metadata: 'gfw_oil_palm',
          url: 'https://tiles.globalforestwatch.org/gfw_oil_palm/v20191031/default/root.json',
        },
      },
      legendConfig: {
        type: 'basic',
        items: [
          {
            name: 'Oil palm concessions',
            color: '#ee9587',
          },
        ],
      },
      interactionConfig: {
        type: 'info',
        config: {
          url: 'https://data-api.globalforestwatch.org/dataset/gfw_oil_palm/v20191031/features',
        },
      },
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2020-12-04T20:34:36.270Z',
      updatedAt: '2021-12-06T21:29:04.286Z',
    },
  },
  {
    id: 'a9024ee8-17cf-47ef-b588-448a8bca22c5',
    type: 'layer',
    attributes: {
      name: 'Global Peatlands',
      slug: 'Global-Peatlands',
      dataset: '40d08bd3-bded-4ab7-b188-fb5ebf8f5e83',
      description: 'Global Peatlands',
      application: ['gfw-pro'],
      iso: [],
      provider: 'featureservice',
      userId: '5c533e5cc3b3242d2ed73bc7',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/a9024ee8-17cf-47ef-b588-448a8bca22c5-1651240249788.png',
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          useCors: true,
          metadata: 'gfw_peatlands',
          url: 'https://tiles.globalforestwatch.org/gfw_peatlands/v20200807/is/{z}/{x}/{y}.png',
        },
      },
      legendConfig: {
        type: 'basic',
        items: [
          {
            name: 'Global Peatlands',
            color: '#253494',
          },
        ],
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2020-01-02T17:54:17.625Z',
      updatedAt: '2022-04-29T13:50:49.711Z',
    },
  },
  {
    id: '13697853-93e1-41a9-bd51-a585337e25d1',
    type: 'layer',
    attributes: {
      name: 'Indonesia Forest Moratorium',
      slug: 'Indonesia-Forest-Moratorium',
      dataset: 'd2119876-76b8-421b-adcf-e069bab83435',
      description: 'Primary Forest',
      application: ['gfw-pro'],
      iso: [],
      provider: 'gee',
      userId: '5c533e5cc3b3242d2ed73bc7',
      default: false,
      protected: false,
      published: true,
      env: 'production',
      layerConfig: {
        type: 'Vector.Layer',
        body: {
          useCors: true,
          metadata: 'idn_forest_moratorium',
          url: 'https://tiles.globalforestwatch.org/idn_forest_moratorium/latest/default/root.json',
        },
      },
      legendConfig: {
        items: [
          {
            name: 'Indonesia Forest Moratorium',
            source: '',
            categories: [
              {
                name: 'Peatland',
                color: '#aaa35d',
              },
              {
                name: 'Forest Area',
                color: '#aa7c5d',
              },
              {
                name: 'Primary Forest',
                color: '#aa5d65',
              },
            ],
            color: '#658434',
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2021-01-04T14:18:26.692Z',
      updatedAt: '2021-03-29T14:54:53.492Z',
    },
  },
  {
    id: 'de6326e0-7006-44cf-a768-8bb4709af364',
    type: 'layer',
    attributes: {
      name: 'WDPA Esri',
      slug: 'WDPA-Esri_1',
      dataset: '08f7c30b-078c-45c6-9878-32cd587cdbb9',
      description: 'WDPA Esri',
      application: ['gfw-pro'],
      iso: [],
      provider: 'featureservice',
      userId: '5c533e5cc3b3242d2ed73bc7',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/de6326e0-7006-44cf-a768-8bb4709af364-1718664647826.png',
      env: 'production',
      layerConfig: {
        type: 'Vector.Layer',
        body: {
          useCors: true,
          metadata: 'wdpa_licensed_protected_areas',
          url: DATASET_URLS.WDPA_TILES,
        },
      },
      legendConfig: {
        type: 'basic',
        items: [
          {
            name: 'Protected Areas',
            categories: [
              {
                name: 'Ia - Strict Nature Reserve',
                color: '#5ca2d1',
              },
              {
                name: 'Ib - Wilderness Area',
                color: '#3e7bb6',
              },
              {
                name: 'II - National Park',
                color: '#0f3b82',
              },
              {
                name: 'III - National Monument or Feature',
                color: '#c9ddff',
              },
              {
                name: 'IV - Habitat and Species Management Area',
                color: '#b9b2a1',
              },
              {
                name: 'V - Protected Landscape or Seascape',
                color: '#ae847e',
              },
              {
                name: 'VI - Protected Area with Sustainable Use of Natural Resources',
                color: '#daa89b',
              },
              {
                name: 'Not Applicable',
                color: '#eed54c',
              },
              {
                name: 'Not Assigned',
                color: '#e7ab36',
              },
              {
                name: 'Not Reported',
                color: '#fa894b',
              },
            ],
            color: '#6087af',
          },
        ],
      },
      interactionConfig: {
        type: 'info',
        config: {
          url: DATASET_URLS.WDPA_API,
        },
      },
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2020-11-25T20:47:08.196Z',
      updatedAt: '2024-06-17T22:50:47.738Z',
    },
  },
  {
    id: '28d775ac-05ac-4ebc-91c2-59d664c59480',
    type: 'layer',
    attributes: {
      name: proLayers.globalIntegratedDisturbanceAlertsId,
      slug: 'Integrated-Deforestation-Alerts',
      dataset: 'e663eb09-04de-4f39-b871-35c6c2ed10b5',
      description: proLayers.globalIntegratedDisturbanceAlertsId,
      application: ['gfw-pro'],
      iso: [],
      provider: 'leaflet',
      userId: '62601518cdc846001a7756b5',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/28d775ac-05ac-4ebc-91c2-59d664c59480-1718114288536.png',
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          useCors: true,
          metadata: 'gfw_integrated_dist_alerts',
          url: 'https://tiles.globalforestwatch.org/gfw_integrated_dist_alerts/latest/dynamic/{z}/{x}/{y}.png?render_type=true_color',
        },
      },
      legendConfig: {
        items: [
          {
            categories: [],
            name: proLayers.globalIntegratedDisturbanceAlertsId,
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2023-11-13T18:21:57.425Z',
      updatedAt: '2024-06-11T13:58:08.443Z',
    },
  },
  {
    id: 'eaafb83a-d0e5-4a15-a0e5-a5528b71bc74',
    type: 'layer',
    attributes: {
      name: 'Tree Plantations by species',
      slug: 'Tree-Plantations-by-species_1',
      dataset: 'eaf07d6c-ba45-4fb9-afb7-a8cbc7e7fc2c',
      description: 'Tree Plantations by species',
      application: ['gfw-pro'],
      iso: [],
      provider: 'featureservice',
      userId: '5c533e5cc3b3242d2ed73bc7',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/eaafb83a-d0e5-4a15-a0e5-a5528b71bc74-1708529121631.png',
      env: 'production',
      layerConfig: {
        body: {
          url: 'https://tiles.globalforestwatch.org/gfw_planted_forests/v20230911/default/{z}/{x}/{y}.png',
          metadata: 'gfw_planted_forests',
          useCors: true,
        },
        type: 'tileLayer',
      },
      legendConfig: {
        items: [
          {
            color: '#cb8335',
            categories: [
              {
                color: '#98a7c4',
                name: 'Wood fiber / timber',
              },
              {
                color: '#fdada9',
                name: 'Oil Palm',
              },
              {
                color: '#a0c746',
                name: 'Unknown Mix',
              },
              {
                color: '#dcd9d9',
                name: 'Unknown',
              },
              {
                color: '#a4fdff',
                name: 'Rubber Mix',
              },
              {
                color: '#fefe97',
                name: 'Fruit Mix',
              },
              {
                color: '#d1e6ab',
                name: 'Other',
              },
              {
                color: '#9993A3',
                name: 'Rubber',
              },
              {
                color: '#dada95',
                name: 'Fruit',
              },
              {
                color: '#fcc4c1',
                name: 'Oil Palm Mix',
              },
              {
                color: '#9ebbf2',
                name: 'Wood fiber / timber Mix',
              },
              {
                color: '#d5a6ea',
                name: 'Recently cleared',
              },
              {
                color: '#e1efc8',
                name: 'Other Mix',
              },
            ],
            name: 'Tree plantations by species',
            source: '(2020, select countries)',
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2019-09-26T20:41:54.726Z',
      updatedAt: '2024-02-21T15:25:21.538Z',
    },
  },
  {
    id: 'df1e5f29-9094-46aa-9eed-71a4b9b95023',
    type: 'layer',
    attributes: {
      name: 'Aboveground live woody biomass density',
      slug: 'Aboveground-live-woody-biomass-density',
      dataset: '39b1c001-08d5-40bf-8e7b-a6def2484eda',
      description: 'Aboveground live woody biomass density',
      application: ['gfw-pro'],
      iso: [],
      provider: 'featureservice',
      userId: '596cde70824315350dd0f116',
      default: false,
      protected: false,
      published: true,
      env: 'production',
      layerConfig: {
        body: {
          metadata: 'aboveground_biomass',
          url: 'http://storage.googleapis.com/earthenginepartners-wri/whrc-hansen-carbon-{thresh}-{z}/{x}/{y}.png',
          useCors: true,
          'css-url':
            'https://github.com/Vizzuality/gfw/blob/develop/app/assets/javascripts/map/views/layers/PantropicalLayer.js',
        },
        type: 'tileLayer',
      },
      legendConfig: {
        items: [
          {
            color: '#d4c4e9',
            source: '(2000)',
            name: 'Aboveground live woody biomass density',
            notes: [
              'Displaying above ground biomass with {thresh} canopy density',
              'For more information about this layer {hyperlink}',
            ],
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2021-12-06T22:20:34.353Z',
      updatedAt: '2021-12-06T22:20:34.354Z',
    },
  },
  {
    id: '8b536a28-87bd-4d25-8782-2a43a4f8866b',
    type: 'layer',
    attributes: {
      name: 'Clark Labs Aquaculture Land Change',
      slug: 'Clark-Labs-Aquaculture-Land-Change',
      dataset: 'e663eb09-04de-4f39-b871-35c6c2ed10b5',
      description: 'Clark Labs Aquaculture Land Change (1999-2018)',
      application: ['gfw-pro'],
      iso: [],
      userId: '62601518cdc846001a7756b5',
      default: false,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/8b536a28-87bd-4d25-8782-2a43a4f8866b-1659054062609.png',
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          url: DATASET_URLS.AQUACULTURE_CHANGE_TILES,
          metadata:
            'https://api.resourcewatch.org/v1/gfw-metadata/clark_labs_tropical_pond_aquaculture',
        },
      },
      legendConfig: {
        items: [
          {
            categories: [
              {
                name: 'Mangrove Persistence',
                color: '#008040',
              },
              {
                name: 'Mangrove → Pond',
                color: '#ff0000',
              },
              {
                name: 'Mangrove → Other',
                color: '#ffff00',
              },
              {
                name: 'Mangrove → Water',
                color: '#8000ff',
              },
              {
                name: 'Pond Persistence',
                color: '#8080ff',
              },
              {
                name: 'Pond → Mangrove',
                color: '#00ff00',
              },
              {
                name: 'Pond → Other',
                color: '#c0c0c0',
              },
              {
                name: 'Pond → Water',
                color: '#16002d',
              },
              {
                name: 'Other → Pond',
                color: '#ff80ff',
              },
              {
                name: 'Wetland Pond',
                color: '#b3ffb3',
              },
              {
                name: 'Wetland → Pond',
                color: '#ff8080',
              },
              {
                name: 'Wetland → Other',
                color: '#ffffbf',
              },
              {
                name: 'Water Persistence',
                color: '#000080',
              },
              {
                name: 'Water → Mangrove',
                color: '#808000',
              },
              {
                name: 'Water → Pond',
                color: '#00ffff',
              },
            ],
            name: 'Tropical Pond Aquaculture and Coastal Wetlands',
            source: '(1999, 2014, 2018, 15m, selected regions)',
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2022-06-23T15:30:55.686Z',
      updatedAt: '2022-07-29T00:21:02.527Z',
    },
  },
  {
    id: '70d5d6b9-5475-4981-a451-5f7ab02b198d',
    type: 'layer',
    attributes: {
      name: 'Tree biomass loss',
      slug: 'Tree-biomass-loss',
      dataset: 'ffcb33cf-ccc6-4eff-9aef-4b00de44abaf',
      description: 'Tree biomass loss',
      application: ['gfw-pro'],
      iso: [],
      provider: 'rest',
      userId: '596cde70824315350dd0f116',
      default: true,
      protected: false,
      published: true,
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          metadata: 'tree_biomass_loss',
          'css-url':
            'https://github.com/Vizzuality/gfw-climate/blob/develop/app/assets/javascripts/map/views/layers/BiomassLossLayer.js',
          url: 'http://storage.googleapis.com/earthenginepartners-wri/whrc-hansen-carbon-{thresh}-{z}/{x}/{y}.png',
          useCors: true,
        },
      },
      legendConfig: {
        items: [
          {
            color: '#fcf9c2',
            name: 'Tree biomass loss',
            source: '(annual, 30m, pantropical, WHRC-Baccini/Hansen/UMD/Google/USGS/NASA)',
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2021-12-06T18:54:20.431Z',
      updatedAt: '2021-12-06T18:54:20.432Z',
    },
  },
  {
    id: 'e21d81eb-3d82-4808-95f9-75851a316fe2',
    type: 'layer',
    attributes: {
      name: 'Cameroon agro-industrial zones',
      slug: 'Cameroon-agro-industrial-zones',
      dataset: 'c3c3e9f8-cc8a-496d-8639-08b58bdae357',
      description: 'Cameroon agro-industrial zones',
      application: ['gfw-pro'],
      iso: [],
      provider: 'featureservice',
      userId: '596cde70824315350dd0f116',
      default: true,
      protected: false,
      published: true,
      env: 'production',
      layerConfig: {
        type: 'Vector.Layer',
        body: {
          useCors: true,
          metadata: 'cmr_oil_palm',
          url: 'https://tiles.globalforestwatch.org/wri_cmr_agro_industrial_zones/v2019/default/root.json',
        },
      },
      legendConfig: {
        type: 'basic',
        items: [
          {
            name: 'Cameroon agro-industrial zones',
            color: '#ee9587',
          },
        ],
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2021-12-06T22:08:39.126Z',
      updatedAt: '2021-12-14T17:53:22.056Z',
    },
  },

  {
    id: 'ff3afd7d-2563-471e-953b-fc5f3e322c3f',
    type: 'layer',
    attributes: {
      name: 'Universal Mill List',
      slug: 'Universal-Mill-List_1',
      dataset: '38af49b0-fb1b-410f-b49b-a8d0ed0dca8c',
      application: ['gfw-pro'],
      iso: [],
      provider: 'featureservice',
      userId: '5c533e5cc3b3242d2ed73bc7',
      default: true,
      protected: false,
      published: true,
      env: 'production',
      layerConfig: {
        type: 'Vector.Layer',
        body: {
          useCors: true,
          metadata: 'uml',
          url: DATASET_URLS.UNIVERSAL_MILL_LIST_TILES,
        },
      },
      legendConfig: {
        type: 'basic',
        items: [
          {
            color: '#e5ea00',
            name: 'Universal Mill List',
          },
        ],
      },
      interactionConfig: {
        type: 'info',
        config: {
          url: 'https://data-api.globalforestwatch.org/dataset/gfw_universal_mill_list/latest/features',
        },
      },
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2021-01-06T15:11:38.457Z',
      updatedAt: '2021-03-29T14:58:45.072Z',
    },
  },

  {
    id: 'e9714be5-f044-42eb-8605-953c84b8d2b2',
    type: 'layer',
    attributes: {
      name: 'RADD alerts',
      slug: 'RADD-alerts_1',
      dataset: 'e663eb09-04de-4f39-b871-35c6c2ed10b5',
      description: 'RADD alerts',
      application: ['gfw-pro'],
      iso: [],
      provider: 'leaflet',
      userId: '5c533e5cc3b3242d2ed73bc7',
      default: true,
      protected: false,
      published: true,
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          options: {
            color: [220, 102, 153],
          },
          'coverage-options': {
            opacity: 0.3,
            color: '#f69',
          },
          'css-url':
            'https://github.com/Vizzuality/gfw/blob/develop/app/assets/javascripts/map/cartocss/style.cartocss',
          url: 'https://tiles.globalforestwatch.org/wur_radd_alerts/latest/default/{z}/{x}/{y}.png',
          useCors: true,
          metadata: 'wur_radd_alerts',
        },
      },
      legendConfig: {
        items: [
          {
            categories: [
              {
                name: 'Recent alerts',
                color: '#e4c600',
              },
              {
                name: 'Show only high confidence alerts',
                color: '#d7668f',
              },
              {
                name: 'Geographic coverage',
                color: '#dc6699',
              },
            ],
            name: 'RADD alerts',
            source: '(every 6-12 days, 10m, select countries, WUR)',
            color: '#dc6699',
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2021-04-12T16:49:15.551Z',
      updatedAt: '2022-01-11T19:05:16.369Z',
    },
  },
  {
    id: 'b212748b-bf7b-4a90-85c6-010aaac5cc38',
    type: 'layer',
    attributes: {
      name: 'Negligible Risk',
      slug: 'Negligible-Risk',
      dataset: 'e663eb09-04de-4f39-b871-35c6c2ed10b5',
      description: 'Negligible Risk',
      application: ['gfw-pro'],
      iso: [],
      provider: 'featureservice',
      userId: '62601518cdc846001a7756b5',
      default: false,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/b212748b-bf7b-4a90-85c6-010aaac5cc38-1695219521368.png',
      env: 'production',
      layerConfig: {
        type: 'Vector.Layer',
        body: {
          useCors: true,
          url: DATASET_URLS.NEGLIGIBLE_RISK_TILES,
          metadata: 'gfwpro_negligible_risk_analysis',
        },
      },
      legendConfig: {
        items: [
          {
            categories: [
              {
                name: 'NO',
                color: '#a40018 ',
              },
              {
                name: 'YES',
                color: '#de8500',
              },
              {
                name: 'No Forest',
                color: '#fffa59',
              },
              {
                name: 'Not Applicable',
                color: '#b2b2b2',
              },
            ],
            name: 'Negligible Risk',
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2023-08-31T14:52:31.903Z',
      updatedAt: '2023-09-20T14:18:41.313Z',
    },
  },
  {
    id: 'aafb62d4-2040-4a07-9d4d-f6e17270243d',
    type: 'layer',
    attributes: {
      name: proLayers.sbtnNaturalLands,
      slug: 'SBTN-Natural-Forest',
      dataset: 'e663eb09-04de-4f39-b871-35c6c2ed10b5',
      description: 'Science Based Targets Network Natural Forest',
      application: ['gfw-pro'],
      iso: [],
      userId: '62601518cdc846001a7756b5',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/aafb62d4-2040-4a07-9d4d-f6e17270243d-1695219637977.png',
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          useCors: true,
          url: 'https://tiles.globalforestwatch.org/sbtn_natural_lands_classification/v1.1/default_pro/{z}/{x}/{y}.png',
          metadata: 'sbtn_natural_lands_classification',
        },
      },
      legendConfig: {
        items: [
          {
            categories: [
              {
                name: 'Natural forest',
                color: '#246E24',
                subCategories: [
                  'Natural forests',
                  'Mangroves',
                  'Wetland natural forests',
                  'Natural peat forests',
                ],
              },
              {
                name: 'Natural Open Ecosystems',
                color: '#B9B91E',
                subCategories: [
                  'Natural short vegetation',
                  'Natural water',
                  'Bare',
                  'Snow',
                  'Wetland natural short vegetation',
                  'Natural peat short vegetation',
                ],
              },
              {
                name: 'Non-natural Classes',
                color: '#D3D3D3',
                subCategories: [
                  'Cropland',
                  'Built-up',
                  'Non-natural tree cover',
                  'Non-natural short vegetation',
                  'Wetland non-natural tree cover',
                  'Non-natural peat tree cover',
                  'Wetland non-natural short vegetation',
                  'Non-natural peat short vegetation',
                ],
              },
            ],
            source: 'Science Based Targets Network',
            name: proLayers.sbtnNaturalLands,
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2023-08-31T17:07:01.060Z',
      updatedAt: '2023-09-20T14:20:37.896Z',
    },
  },

  {
    id: '711cee4f-9d8c-44cf-a043-918cee8dcd0c',
    type: 'layer',
    attributes: {
      name: 'Brazil Biomes',
      slug: 'Brazil-Biomes',
      dataset: '2024cbf5-59f6-4671-b5f4-8c73b6a2abb9',
      description: 'Brazil Biomes',
      application: ['gfw-pro'],
      iso: [],
      provider: 'featureservice',
      userId: '596cde70824315350dd0f116',
      default: true,
      protected: false,
      published: true,
      env: 'production',
      layerConfig: {
        type: 'Vector.Layer',
        body: {
          useCors: true,
          metadata: 'bra_biomes',
          url: 'https://tiles.globalforestwatch.org/ibge_bra_biomes/v2004/default/root.json',
        },
      },
      legendConfig: {
        type: 'basic',
        items: [
          {
            categories: [
              {
                color: '#136400',
                name: 'Amazônia',
              },
              {
                color: '#49CC4C',
                name: 'Caatinga',
              },
              {
                color: '#9ECC49',
                name: 'Cerrado',
              },
              {
                color: '#5CA2D1',
                name: 'Mata Atlântica',
              },
              {
                color: '#63802E',
                name: 'Pampa',
              },
              {
                color: '#0F3B82',
                name: 'Pantanal',
              },
            ],
            color: '#bacd3c',
            name: 'Brazil biomes',
          },
        ],
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2021-11-16T11:40:10.925Z',
      updatedAt: '2021-12-06T18:00:52.730Z',
    },
  },
  {
    id: 'b696ec7a-2852-468a-a907-b2cf4f584b98',
    type: 'layer',
    attributes: {
      name: 'Colombia - Frontera Agrícola',
      slug: 'colombia-frontera-agricola',
      dataset: '3b85ed4b-16ae-4218-855b-12a6e1652121',
      description: 'Colombia - Frontera Agrícola',
      application: ['gfw-pro'],
      iso: [],
      provider: 'featureservice',
      userId: '596cde70824315350dd0f116',
      default: true,
      protected: false,
      published: true,
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          url: 'https://tiles.globalforestwatch.org/col_frontera_agricola/v2024/category/{z}/{x}/{y}.png',
          metadata: 'col_frontera_agricola',
          useCors: true,
        },
      },
      legendConfig: {
        type: 'basic',
        items: [
          {
            categories: [
              {
                name: 'Unconditioned',
                color: '#A0BB51',
              },
              {
                name: 'Conditioned',
                color: '#F7CD54',
              },
              {
                name: 'Restricted',
                color: '#DA3D30',
              },
            ],
            name: 'Colombia - Frontera Agrícola',
          },
        ],
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2021-12-06T22:12:06.352Z',
      updatedAt: '2023-06-14T23:46:19.625Z',
    },
  },
  {
    id: 'dc6f6dd2-0718-4e41-81d2-109866bb9edd',
    type: 'layer',
    attributes: {
      name: 'Tree cover 2000',
      slug: 'tree-cover',
      dataset: '044f4af8-be72-4999-b7dd-13434fc4a394',
      description: 'Tree cover',
      application: ['gfw-pro'],
      iso: [],
      provider: 'leaflet',
      userId: '596cde70824315350dd0f116',
      default: true,
      protected: false,
      published: true,
      env: 'production',
      layerConfig: {
        body: {
          url: 'https://earthengine.google.org/static/hansen_2014/gfw_loss_tree_year_{thresh}_2014/{z}/{x}/{y}.png',
          format: 'image/png',
          useCors: true,
          maxzoom: 12,
          options: {
            color: '#97BD3D',
            dataMaxZoom: 12,
            threshold: 30,
          },
          metadata: 'tree_cover',
          minzoom: 3,
        },
        params_config: [],
        service: 'leaflet',
        sql_config: [],
        type: 'tileLayer',
        url: 'https://earthengine.google.org/static/hansen_2014/gfw_loss_tree_year_{thresh}_2014/{z}/{x}/{y}.png',
      },
      legendConfig: {
        type: 'basic',
        items: [
          {
            notes: ['Displaying tree cover with {thresh} canopy density.'],
            color: '#97BD3D',
            name: 'Tree cover',
            source: '(2000, Hansen/UMD/Google/USGS/NASA)',
          },
        ],
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2017-09-14T18:45:21.473Z',
      updatedAt: '2018-07-19T08:33:23.226Z',
    },
  },

  {
    id: '43751eb3-3934-4e16-86bb-43bb37002489',
    type: 'layer',
    attributes: {
      name: 'Soy Planted Area',
      slug: 'Soy-Planted-Area_1',
      dataset: 'ca244e10-0b1b-42dc-93d7-a8853493a550',
      description: 'Soy Planted Area',
      application: ['gfw-pro'],
      iso: [],
      provider: 'leaflet',
      userId: '5c533e5cc3b3242d2ed73bc7',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/43751eb3-3934-4e16-86bb-43bb37002489-1712067530687.png',
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          options: {
            color: [220, 102, 153],
          },
          'coverage-options': {
            opacity: 1,
            color: '#f69',
          },
          'css-url':
            'https://github.com/Vizzuality/gfw/blob/develop/app/assets/javascripts/map/cartocss/style.cartocss',
          useCors: true,
          metadata: 'umd_soy_planted_area',
          url: 'https://tiles.globalforestwatch.org/umd_soy_planted_area/v4/{year}/{z}/{x}/{y}.png',
        },
      },
      legendConfig: {
        items: [
          {
            categories: [
              {
                name: 'Soy Planted Area',
                color: '#98BD46',
              },
            ],
            name: 'Soy Planted Area',
            source: '(2000-2019, S. America, Song et al. 2021)',
            color: '#98BD46',
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2021-04-16T10:59:13.147Z',
      updatedAt: '2024-04-02T14:18:50.595Z',
    },
  },

  {
    id: 'ed836651-f1a2-4ebc-bdb4-d341b68bd544',
    type: 'layer',
    attributes: {
      name: 'Land cover',
      slug: 'land-cover',
      dataset: '75b2f1a2-b2e5-40bb-97f8-ec414c58613e',
      description: 'Land cover',
      application: ['gfw-pro'],
      iso: [],
      provider: 'gee',
      userId: '596cde70824315350dd0f116',
      default: true,
      protected: false,
      published: true,
      env: 'production',
      layerConfig: {
        body: {
          metadata: 'global_landcover_2015',
          useCors: true,
          url: 'https://s3.amazonaws.com/wri-tiles/global-landcover-2015/{z}/{x}/{y}.png',
        },
        type: 'tileLayer',
      },
      legendConfig: {
        type: 'basic',
        items: [
          {
            name: 'Land Cover',
            categories: [
              {
                name: 'Agriculture',
                color: '#d2a964',
              },
              {
                name: 'Forest',
                color: '#377764',
              },
              {
                name: 'Grassland',
                color: '#ccdb98',
              },
              {
                name: 'Shrubland',
                color: '#596b2d',
              },
              {
                name: 'Sparse vegetation',
                color: '#d6ca98',
              },
              {
                name: 'Wetland',
                color: '#2e89d5',
              },
              {
                name: 'Settlement',
                color: '#e94633',
              },
              {
                name: 'Bare',
                color: '#f6f0ea',
              },
              {
                name: 'Water',
                color: '#a3dcfc',
              },
              {
                name: 'Permanent snow and ice',
                color: '#ffffff',
              },
            ],
            source: '(ESA/UCLouvain, 2015)',
            color: '#ceaf66',
          },
        ],
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2017-09-14T18:45:21.130Z',
      updatedAt: '2019-02-25T15:55:07.752Z',
    },
  },

  {
    id: '7e133f7a-2e2e-49c2-b736-14556eb5ffab',
    type: 'layer',
    attributes: {
      name: 'Intact Forest Landscapes',
      slug: 'Intact-Forest-Landscapes',
      dataset: '79e15345-5c83-4d41-94b4-03f2b2018b77',
      description: 'Intact Forest Landscapes',
      application: ['gfw-pro'],
      iso: [],
      provider: 'featureservice',
      userId: '596cde70824315350dd0f116',
      default: false,
      protected: false,
      published: true,
      env: 'production',
      layerConfig: {
        body: {
          metadata: 'intact_forest_landscapes_change',
          useCors: true,
          url: 'https://tiles.globalforestwatch.org/ifl_intact_forest_landscapes/v2018/default/root.json',
        },
        type: 'Vector.Layer',
      },
      legendConfig: {
        items: [
          {
            name: 'Intact Forest Landscapes',
            categories: [
              {
                name: 'Intact Forest Landscapes',
                color: '#5c8c50',
              },
              {
                name: 'Reduction in extent 2000-2013',
                color: '#969905',
              },
              {
                name: 'Reduction in extent 2013-2016',
                color: '#635731',
              },
            ],
            source: '(2000/2016)',
            color: '#136400',
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2021-11-16T11:47:37.066Z',
      updatedAt: '2021-11-16T11:58:01.740Z',
    },
  },
  {
    id: 'c3bf6eb4-4d36-441a-8935-67a15d618397',
    type: 'layer',
    attributes: {
      name: 'Tree cover loss',
      slug: 'tree-cover-loss',
      dataset: '3f3da1e2-0891-4fed-9460-a53c01ba211a',
      description: 'Tree cover loss 2016',
      application: ['gfw-pro'],
      iso: [],
      provider: 'gee',
      userId: '596cde70824315350dd0f116',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/c3bf6eb4-4d36-441a-8935-67a15d618397-1713454638519.png',
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          options: {
            dataMaxZoom: 12,
            color: [220, 108, 154],
            threshold: 30,
          },
          'css-url':
            'https://github.com/Vizzuality/gfw/blob/3be365eadf2ce0c58a8bb65b5a187abe27482a6e/app/assets/javascripts/map/views/layers/LossLayer.js',
          useCors: true,
          metadata: 'umd_tree_cover_loss_v1.12',
          url: 'https://tiles.globalforestwatch.org/umd_tree_cover_loss/v1.12/dynamic/{z}/{x}/{y}.png?start_year={start_year}&end_year={end_year}&tree_cover_density_threshold={thresh}&render_type=true_color',
        },
      },
      legendConfig: {
        type: 'basic',
        items: [
          {
            notes: [
              'Displaying loss with {thresh} canopy density.',
              'Tree cover loss is not always deforestation.',
            ],
            source: '(annual, 30m, global, Hansen/UMD/Google/USGS/NASA)',
            name: 'Tree cover loss',
            color: '#dc6c9a',
          },
        ],
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2017-09-14T18:45:21.831Z',
      updatedAt: '2024-04-18T15:37:18.277Z',
    },
  },

  {
    id: '63c9f38a-8ff4-492b-a4a0-80c437afcd2c',
    type: 'layer',
    attributes: {
      name: 'Tree cover gain',
      slug: 'tree-cover-gain',
      dataset: 'ae3a9478-de14-4f24-a9d7-79358ec37e25',
      description: 'Tree cover gain',
      application: ['gfw-pro'],
      iso: [],
      provider: 'leaflet',
      userId: '596cde70824315350dd0f116',
      default: true,
      protected: false,
      published: true,
      env: 'production',
      layerConfig: {
        body: {
          format: 'image/png',
          metadata: 'tree_cover_gain',
          useCors: true,
          maxzoom: 12,
          minzoom: 3,
        },
        type: 'tileLayer',
        service: 'leaflet',
        url: 'https://tiles.globalforestwatch.org/umd_tree_cover_gain_from_height/v20240126/default/{z}/{x}/{y}.png',
      },
      legendConfig: {
        type: 'basic',
        items: [
          {
            name: 'Tree cover gain',
            source: '(12 years, 30m, global, Hansen/UMD/Google/USGS/NASA)',
            color: '#4600ff',
          },
        ],
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2017-09-14T18:45:22.951Z',
      updatedAt: '2018-08-08T07:26:45.159Z',
    },
  },

  {
    id: 'aaf205a2-97b3-4f44-9330-080ec8e6f93f',
    type: 'layer',
    attributes: {
      name: 'Land Cover Southeast Asia',
      slug: 'Land-Cover-Southeast-Asia',
      dataset: '3b85ed4b-16ae-4218-855b-12a6e1652121',
      description: 'Land Cover Southeast Asia',
      application: ['gfw-pro'],
      iso: [],
      provider: 'featureservice',
      userId: '596cde70824315350dd0f116',
      default: true,
      protected: false,
      published: true,
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          url: 'https://tiles.globalforestwatch.org/rspo_southeast_asia_land_cover_2010/v2013/gfwpro/{z}/{x}/{y}.png',
          metadata: 'se_asia_landcover',
          useCors: true,
        },
      },
      legendConfig: {
        type: 'basic',
        items: [
          {
            color: '#c6a541',
            categories: [
              {
                color: '#d6d549',
                name: 'Bare land',
              },
              {
                color: '#cfe6ff',
                name: 'Coastal fish pond',
              },
              {
                color: '#ebc963',
                name: 'Rubber plantation',
              },
              {
                color: '#ddb400',
                name: 'Agriculture',
              },
              {
                color: '#ddffac',
                name: 'Secondary forest',
              },
              {
                color: '#fdffac',
                name: 'Grassland / shrub',
              },
              {
                color: '#000000',
                name: 'Mining',
              },
              {
                color: '#ccaa57',
                name: 'Mixed tree crops',
              },
              {
                color: '#c0b9a6',
                name: 'No data',
              },
              {
                color: '#b35fc4',
                name: 'Oil palm plantation',
              },
              {
                color: '#f5babf',
                name: 'Settlements',
              },
              {
                color: '#7da19b',
                name: 'Swamp',
              },
              {
                color: '#91773f',
                name: 'Timber plantation',
              },
              {
                color: '#8abc65',
                name: 'Primary forest',
              },
              {
                color: '#94b5ff',
                name: 'Water bodies',
              },
            ],
            name: 'Land cover Southeast Asia',
          },
        ],
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2024-07-04T14:56:28.594Z',
      updatedAt: '2018-04-02T19:32:32.427Z',
    },
  },

  {
    id: '30128f93-4164-47dd-8364-0c099d4aeda6',
    type: 'layer',
    attributes: {
      name: 'Primary Forest',
      slug: 'Primary-Forest',
      dataset: 'edd8b82c-1597-4d81-899b-60ab61808367',
      description: 'Primary Forest',
      application: ['gfw-pro'],
      iso: [],
      provider: 'gee',
      userId: '596cde70824315350dd0f116',
      default: false,
      protected: false,
      published: true,
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          useCors: true,
          metadata: 'regional_primary_forests',
          url: 'https://production-api.globalforestwatch.org/v1/layer/41086554-5ca5-456c-80dd-f6bee61bc45f/tile/gee/{z}/{x}/{y}',
        },
      },
      legendConfig: {
        items: [
          {
            name: 'Primary forests',
            source: '2001, 30m, Pan-Tropical, UMD',
            categories: [
              {
                name: 'Primary forest',
                color: '#658434',
              },
            ],
            color: '#658434',
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2020-01-02T17:41:01.632Z',
      updatedAt: '2020-12-17T17:29:49.881Z',
    },
  },

  {
    id: '7c43084e-3687-4c2d-9705-c566759273ad',
    type: 'layer',
    attributes: {
      name: proLayers.raddCoverageID,
      slug: 'RADD-Coverage',
      dataset: 'e663eb09-04de-4f39-b871-35c6c2ed10b5',
      description: 'Geographic Coverage',
      application: ['gfw-pro'],
      iso: [],
      provider: 'leaflet',
      userId: '5c533e5cc3b3242d2ed73bc7',
      default: true,
      protected: false,
      published: true,
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          options: {
            color: [252, 204, 220],
          },
          'coverage-options': {
            opacity: 0.4,
            color: '#f69',
          },
          'css-url':
            'https://github.com/Vizzuality/gfw/blob/develop/app/assets/javascripts/map/cartocss/style.cartocss',
          url: 'https://tiles.globalforestwatch.org/wur_radd_coverage/v20211016/default/{z}/{x}/{y}.png',
          useCors: true,
          metadata: 'wur_radd_alerts',
        },
      },
      legendConfig: {
        items: [
          {
            categories: [
              {
                name: 'Geographic Coverage',
                color: '#dc6699',
              },
            ],
            name: 'Geographic Coverage',
            source: '(every 6-12 days, 10m, select countries, WUR)',
            color: '#dc6699',
          },
        ],
        type: 'disabled',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2021-04-16T08:25:16.353Z',
      updatedAt: '2021-12-14T18:24:42.065Z',
    },
  },
  {
    id: '82fe2f2a-30d3-4e63-b612-051ca55c2022',
    type: 'layer',
    attributes: {
      name: 'GLAD-L Alerts Geographic Coverage',
      slug: 'GLAD-L-Alerts-Geographic-Coverage',
      dataset: 'e663eb09-04de-4f39-b871-35c6c2ed10b5',
      description: 'GLAD-L Alerts Geographic Coverage',
      application: ['gfw-pro'],
      iso: [],
      provider: 'leaflet',
      userId: '62601518cdc846001a7756b5',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/82fe2f2a-30d3-4e63-b612-051ca55c2022-1718114853389.png',
      env: 'production',
      layerConfig: {
        type: 'Vector.Layer',
        body: {
          url: 'https://tiles.globalforestwatch.org/umd_glad_landsat_alerts_coverage/v2024/default/root.json',
          useCors: true,
          metadata: 'umd_landsat_alerts',
        },
      },
      legendConfig: {
        items: [
          {
            name: 'GLAD-L Alerts Geographic Coverage',
            color: '#f69',
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2023-12-18T17:27:15.037Z',
      updatedAt: '2024-06-11T14:07:33.312Z',
    },
  },
  {
    id: 'd76fc62e-8f13-4a1b-bb51-60aef1ee08b1',
    type: 'layer',
    attributes: {
      name: 'VIIRS Global Fires',
      slug: 'VIIRS-Global-Fires_3',
      dataset: 'cc074b15-d311-43cf-8dba-beec571d2406',
      description: 'VIIRS active fire alerts',
      application: ['gfw-pro'],
      iso: [],
      provider: 'featureservice',
      type: 'layer',
      userId: '5c533e5cc3b3242d2ed73bc7',
      default: false,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/d76fc62e-8f13-4a1b-bb51-60aef1ee08b1-1645634765475.png',
      env: 'production',
      layerConfig: {
        type: 'Vector.Layer',
        body: {
          url: 'https://tiles.globalforestwatch.org/nasa_viirs_fire_alerts/latest/dynamic/{start_date}/{end_date}/VectorTileServer',
          metadata: 'viirs_fires',
          useCors: true,
        },
      },
      legendConfig: {
        type: 'basic',
        items: [
          {
            notes: ['For more information about this layer {hyperlink}'],
            source: '(daily, 375m, global, NASA)',
            color: '#a5140c',
            name: 'VIIRS active fires',
          },
        ],
      },
      interactionConfig: {
        type: 'info',
        config: {
          url: DATASET_URLS.NASA_VIIRS_API,
        },
      },
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2020-01-02T18:10:07.205Z',
      updatedAt: '2022-02-23T16:46:05.371Z',
    },
  },
  {
    id: 'b696ec7a-2852-468a-a907-b2cf4f584b97',
    type: 'layer',
    attributes: {
      name: 'Indonesia Land Cover',
      slug: 'Indonesia-Land-Cover',
      dataset: '7b5c2316-8f97-41de-a268-06dc735cc8e9',
      description: 'Indonesia Land Cover',
      application: ['gfw-pro'],
      iso: [],
      provider: 'featureservice',
      userId: '596cde70824315350dd0f116',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/b696ec7a-2852-468a-a907-b2cf4f584b97-1686786379679.png',
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          useCors: true,
          metadata: 'idn_land_cover_metadata',
          url: DATASET_URLS.IDN_LAND_COVER_TILES,
        },
      },
      legendConfig: {
        type: 'basic',
        items: [
          {
            color: '#c6a541',
            categories: [
              {
                color: '#4CAF50',
                name: 'Primary forest',
              },
              {
                color: '#A6F25B',
                name: 'Secondary forest',
              },
              {
                color: '#E5E5A4',
                name: 'Plantation forest',
              },
              {
                color: '#6C7526',
                name: 'Grass land',
              },
              {
                color: '#C49A6C',
                name: 'Cropland',
              },
              {
                color: '#DB6F3C',
                name: 'Other land',
              },
              {
                color: '#000000',
                name: 'Settlement area',
              },
              {
                color: '#AEEEEE',
                name: 'Wetland',
              },
              {
                color: '#D3D3D3',
                name: 'Unknown',
              },
              {
                color: '#3A80C2',
                name: 'Bodies of water',
              },
            ],
            name: 'Land cover Indonesia',
          },
        ],
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2021-12-06T22:12:06.352Z',
      updatedAt: '2023-06-14T23:46:19.625Z',
    },
  },
  {
    id: 'df72f8eb-2466-405d-8501-70eded5c47f2',
    type: 'layer',
    attributes: {
      name: 'jrc_global_forest_cover',
      slug: 'jrc_global_forest_cover',
      dataset: 'e663eb09-04de-4f39-b871-35c6c2ed10b5',
      description: 'JRC Forest Cover',
      application: ['gfw-pro'],
      iso: [],
      userId: '62601518cdc846001a7756b5',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/df72f8eb-2466-405d-8501-70eded5c47f2-1714575424492.png',
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          url: 'https://tiles.globalforestwatch.org/jrc_global_forest_cover/v2020.2/default/{z}/{x}/{y}.png',
          metadata: 'jrc_global_forest_cover',
        },
      },
      legendConfig: {
        items: [
          {
            color: '#7266F9',
            name: 'JRC Forest Cover',
            source: 'Joint Research Center',
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2024-05-01T14:35:32.979Z',
      updatedAt: '2024-05-01T14:57:04.389Z',
    },
  },

  {
    id: '825c9a3d-054f-45f4-b055-f4a95991a036',
    type: 'layer',
    attributes: {
      name: 'Land Planning Classification of Native Forests',
      slug: 'Ordenamiento-Territorial-de-los-Bosques-Nativos-OTBN',
      dataset: 'e663eb09-04de-4f39-b871-35c6c2ed10b5',
      description:
        'Territorial Regulation of Native Forests in Argentina. Ordenamiento Territorial de los Bosques Nativos (OTBN)',
      application: ['gfw-pro'],
      iso: [],
      userId: '62601518cdc846001a7756b5',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/825c9a3d-054f-45f4-b055-f4a95991a036-1712067710592.png',
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          url: DATASET_URLS.ARG_FOREST_TILES,
          metadata: 'arg_native_forest_land_plan',
        },
      },
      legendConfig: {
        items: [
          {
            categories: [
              {
                name: 'I',
                color: '#EE2521',
              },
              {
                name: 'II',
                color: '#FFCC33',
              },
              {
                name: 'III',
                color: '#97BD3D',
              },
            ],
            name: 'Territorial Planning of Native Forests',
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2023-03-06T16:19:32.380Z',
      updatedAt: '2024-04-02T14:21:50.458Z',
    },
  },
  {
    id: 'c5b2ddeb-8a52-48a2-8f62-bdbe60da971b',
    type: 'layer',
    attributes: {
      name: 'Clark Labs Aquaculture Land Cover 2018',
      slug: 'Clark-Labs-Aquaculture-Land-Cover-2018',
      dataset: 'e663eb09-04de-4f39-b871-35c6c2ed10b5',
      description: 'Clark Labs Aquaculture Land Cover 2018',
      application: ['gfw-pro'],
      iso: [],
      userId: '62601518cdc846001a7756b5',
      default: false,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/c5b2ddeb-8a52-48a2-8f62-bdbe60da971b-1659054162607.png',
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          url: DATASET_URLS.AQUACULTURE_2018_TILES,
          metadata:
            'https://api.resourcewatch.org/v1/gfw-metadata/clark_labs_tropical_pond_aquaculture',
        },
      },
      legendConfig: {
        items: [
          {
            categories: [
              {
                name: 'Mangrove',
                color: '#244e0c',
              },
              {
                name: 'Coastal Wetland',
                color: '#69b792',
              },
              {
                name: 'Pond Aquaculutre',
                color: '#de5a20',
              },
              {
                name: 'Water',
                color: '#7d7dff',
              },
              {
                name: 'Other Landcover',
                color: '#f5e483',
              },
              {
                name: 'Missing',
                color: '#c0c0c0',
              },
            ],
            name: 'Tropical Pond Aquaculture and Coastal Wetlands',
            source: '(1999, 2014, 2018, 15m, selected regions)',
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2022-06-07T14:11:35.440Z',
      updatedAt: '2022-07-29T00:22:42.547Z',
    },
  },
  {
    id: 'df061662-8c65-4286-8740-2c713103de03',
    type: 'layer',
    attributes: {
      name: 'GLAD-S2 alerts geographic coverage',
      slug: 'GLAD-S2-alerts-geographic-coverage',
      dataset: 'e663eb09-04de-4f39-b871-35c6c2ed10b5',
      description: 'GLAD-S2 alerts geographic coverage',
      application: ['gfw-pro'],
      iso: [],
      provider: 'leaflet',
      userId: '62601518cdc846001a7756b5',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/df061662-8c65-4286-8740-2c713103de03-1702313867786.png',
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          options: {
            color: [220, 102, 153],
          },
          'coverage-options': {
            opacity: 0.3,
            color: '#f69',
          },
          'css-url':
            'https://github.com/Vizzuality/gfw/blob/develop/app/assets/javascripts/map/cartocss/style.cartocss',
          url: 'https://tiles.globalforestwatch.org/umd_glad_sentinel2_alerts_coverage/latest/default/{z}/{x}/{y}.png',
          useCors: true,
          metadata: 'umd_glad_sentinel2_alerts',
        },
      },
      legendConfig: {
        items: [
          {
            categories: [
              {
                name: 'GLAD-S2 alerts geographic coverage',
                color: '#f69',
              },
            ],
            name: 'GLAD-S2 alerts geographic coverage',
            source: '(weekly, 30m, select countries, UMD/GLAD)',
            color: '#dc6699',
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2023-12-11T16:57:47.649Z',
      updatedAt: '2023-12-11T16:57:47.649Z',
    },
  },
  {
    id: 'b2f5542d-d442-42ee-9cb5-4c8d2bd47526',
    type: 'layer',
    attributes: {
      name: 'argentinean-native-forests-loss',
      slug: 'argentinean_native-forests_loss',
      dataset: 'e663eb09-04de-4f39-b871-35c6c2ed10b5',
      description: 'National Monitoring System of Native Forests',
      application: ['gfw-pro'],
      iso: [],
      provider: 'leaflet',
      userId: '62601518cdc846001a7756b5',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/b2f5542d-d442-42ee-9cb5-4c8d2bd47526-1715178229088.png',
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          url: 'https://tiles.globalforestwatch.org/arg_otbn_forest_loss/v2022/year/{z}/{x}/{y}.png',
          useCors: true,
          metadata: 'arg_otbn_forest_loss',
        },
      },
      legendConfig: {
        items: [
          {
            name: 'National Monitoring System of Native Forests',
            source: 'Ministery of the Environment and Sustainable Development',
            color: '#c47d02',
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2024-05-03T17:50:48.422Z',
      updatedAt: '2024-05-08T14:23:48.992Z',
    },
  },
  {
    id: 'a110a1a8-3d2f-4696-babc-6c54d0b7b459',
    type: 'layer',
    attributes: {
      name: 'cocoa_deforestation_risk',
      slug: 'cocoa_deforestation_risk',
      dataset: 'e663eb09-04de-4f39-b871-35c6c2ed10b5',
      description: 'Cocoa Deforestation Risk Assessment',
      application: ['gfw-pro'],
      iso: [],
      provider: 'leaflet',
      userId: '62601518cdc846001a7756b5',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/a110a1a8-3d2f-4696-babc-6c54d0b7b459-1709565090746.png',
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          options: {
            color: [220, 102, 153],
          },
          'coverage-options': {
            opacity: 0.3,
            color: '#f69',
          },
          'css-url':
            'https://github.com/Vizzuality/gfw/blob/develop/app/assets/javascripts/map/cartocss/style.cartocss',
          url: DATASET_URLS.WEST_AFRICA_COCOA_TILES,
          useCors: true,
          metadata:
            'https://api.resourcewatch.org/v1/gfw-metadata/gfw_west_africa_cocoa_deforestation_risk',
        },
      },
      legendConfig: {
        items: [
          {
            categories: [
              {
                color: '#3900b3ff',
                name: 'High',
              },
              {
                color: '#714dbfff',
                name: 'Mid-high',
              },
              {
                color: '#9e6b90ff',
                name: 'Medium',
              },
              {
                color: '#cf9270ff',
                name: 'Mid-low',
              },
              {
                color: '#ebb698ff',
                name: 'Low',
              },
            ],
            name: 'Cocoa Deforestation Risk Assessment (Cocoa DRA)',
            source: 'World Resources Institute',
            color: '#dc6699',
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2024-02-14T18:45:29.776Z',
      updatedAt: '2024-03-04T15:11:30.613Z',
    },
  },
  {
    id: 'b696ec7a-2852-468a-a907-b2cf4f584b95',
    type: 'layer',
    attributes: {
      name: proLayers.disturbanceAlertsDriversId,
      slug: 'Drivers-of-disturbance-alerts',
      dataset: '7b5c2316-8f97-41de-a268-06dc735cc8e9',
      description: proLayers.disturbanceAlertsDriversId,
      application: ['gfw-pro'],
      iso: [],
      provider: 'leaflet',
      userId: '596cde70824315350dd0f116',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/b696ec7a-2852-468a-a907-b2cf4f584b97-1686786379679.png',
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          useCors: true,
          metadata: 'wur_alert_drivers',
          url: 'https://tiles.globalforestwatch.org/gfw_integrated_alerts_drivers/v20250925/dynamic/{z}/{x}/{y}.png?render_type=true_color',
        },
      },
      legendConfig: {
        type: 'basic',
        items: [
          {
            color: '#c6a541',
            categories: [],
            name: proLayers.disturbanceAlertsDriversId,
          },
        ],
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2021-12-06T22:12:06.352Z',
      updatedAt: '2023-06-14T23:46:19.625Z',
    },
  },
  {
    id: 'e045c55c-3455-4a19-8ee8-e0cbe9926085',
    type: 'layer',
    attributes: {
      name: 'GLAD-S2 alerts',
      slug: 'GLAD-S2-alerts_4',
      dataset: 'e663eb09-04de-4f39-b871-35c6c2ed10b5',
      description: 'GLAD-S2 alerts',
      application: ['gfw-pro'],
      iso: [],
      provider: 'leaflet',
      userId: '62601518cdc846001a7756b5',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/e045c55c-3455-4a19-8ee8-e0cbe9926085-1718114549917.png',
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          options: {
            color: [220, 102, 153],
          },
          'coverage-options': {
            opacity: 0.3,
            color: '#f69',
          },
          'css-url':
            'https://github.com/Vizzuality/gfw/blob/develop/app/assets/javascripts/map/cartocss/style.cartocss',
          url: 'https://tiles.globalforestwatch.org/umd_glad_sentinel2_alerts/latest/default/{z}/{x}/{y}.png',
          useCors: true,
          metadata: 'umd_glad_sentinel2_alerts',
        },
      },
      legendConfig: {
        items: [
          {
            categories: [
              {
                name: 'GLAD-S2 alerts',
                color: '#f69',
              },
            ],
            name: 'GLAD-S2 alerts',
            source: '(weekly, 10m, select countries, UMD/GLAD)',
            color: '#dc6699',
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2023-12-11T16:37:08.978Z',
      updatedAt: '2024-06-11T14:02:29.834Z',
    },
  },
  {
    id: '94caf28e-e94e-45bb-981b-e9ee3ab0a615',
    type: 'layer',
    attributes: {
      name: proLayers.pastureRecoveryPotential,
      slug: 'Pasture-Recovery-Potential_1',
      dataset: '38af49b0-fb1b-410f-b49b-a8d0ed0dca8c',
      application: ['gfw-pro'],
      iso: [],
      provider: 'featureservice',
      userId: '5c533e5cc3b3242d2ed73bc7',
      default: true,
      protected: false,
      published: true,
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          useCors: true,
          url: 'https://tiles.globalforestwatch.org/lapig_degraded_pasture/v20250627/default/{z}/{x}/{y}.png',
        },
      },
      legendConfig: {
        items: [
          {
            categories: [
              {
                color: '#EBD1A4',
                name: 'Low',
              },
              {
                color: '#CC5C87',
                name: 'Medium',
              },
              {
                color: '#7D274B',
                name: 'High',
              },
            ],
            name: proLayers.pastureRecoveryPotential,
            color: '#98BD46',
          },
        ],
        type: 'basic',
      },
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2021-01-06T15:11:38.457Z',
      updatedAt: '2021-03-29T14:58:45.072Z',
    },
  },

  {
    id: '7c43084e-3687-4c2d-9705-c56675927392',
    type: 'layer',
    attributes: {
      name: proLayers.disturbanceAlertsDriversGeographicCoverageId,
      slug: 'Alerts-Drivers-Coverage',
      dataset: 'e663eb09-04de-4f39-b871-35c6c2ed10b5',
      description: 'Geographic Coverage',
      application: ['gfw-pro'],
      iso: [],
      provider: 'esrivectorservice',
      userId: '5c533e5cc3b3242d2ed73bc7',
      default: true,
      protected: false,
      published: true,
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          options: {
            color: [252, 204, 220],
          },
          'coverage-options': {
            opacity: 0.3,
            color: '#f69',
          },
          'css-url':
            'https://github.com/Vizzuality/gfw/blob/develop/app/assets/javascripts/map/cartocss/style.cartocss',
          url: 'https://tiles.globalforestwatch.org/wur_alert_drivers_coverage/v20251007.1/default/{z}/{x}/{y}.png',
          useCors: true,
          metadata: 'wur_alert_drivers',
        },
      },
      legendConfig: {
        items: [
          {
            categories: [
              {
                name: 'Geographic Coverage',
                color: '#dc6699',
              },
            ],
            name: 'Geographic Coverage',
            source: '',
            color: '#dc6699',
          },
        ],
        type: 'disabled',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2021-04-16T08:25:16.353Z',
      updatedAt: '2021-12-14T18:24:42.065Z',
    },
  },
  {
    id: 'b696ec7a-2852-468a-a907-b2cf4f544b91',
    type: 'layer',
    attributes: {
      name: proLayers.globalVegetationDisturbanceAlertsId,
      slug: 'global-vegetation-disturbance-alerts',
      dataset: '7b5c2316-8f97-41de-a268-06dc735cc8e9',
      description: proLayers.globalVegetationDisturbanceAlertsId,
      application: ['gfw-pro'],
      iso: [],
      provider: 'leaflet',
      userId: '596cde70824315350dd0f116',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/b696ec7a-2852-468a-a907-b2cf4f584b91-1686786379679.png',
      env: 'production',
      layerConfig: {
        type: 'tileLayer',
        body: {
          useCors: true,
          metadata: 'umd_glad_dist_alerts',
          url: 'https://tiles.globalforestwatch.org/umd_glad_dist_alerts/latest/dynamic/{z}/{x}/{y}.png?render_type=true_color&alert_confidence=high',
        },
      },
      legendConfig: {
        type: 'basic',
        items: [
          {
            color: '#c6a541',
            categories: [],
            name: proLayers.globalVegetationDisturbanceAlertsId,
          },
        ],
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2021-12-06T22:12:06.352Z',
      updatedAt: '2023-06-14T23:46:19.625Z',
    },
  },
  {
    id: 'b0b0b73a-1d9e-4230-9dec-8fb1b0f207e0',
    type: 'layer',
    attributes: {
      name: proLayers.globalVegetationDisturbanceAlertsGeographicCoverageId,
      slug: 'umd-glad-landsat-alerts-coverage',
      dataset: 'e663eb09-04de-4f39-b871-35c6c2ed10b5',
      description: proLayers.globalVegetationDisturbanceAlertsGeographicCoverageId,
      application: ['gfw-pro'],
      iso: [],
      provider: 'leaflet',
      userId: '62601518cdc846001a7756b5',
      default: true,
      protected: false,
      published: true,
      thumbnailUrl:
        'https://s3.amazonaws.com/wri-api-backups/resourcewatch/prod/thumbnails/b0b0b73a-1d9e-4259-9dec-8fb1b0f207e0-1702307467296.png',
      env: 'production',
      layerConfig: {
        type: 'Vector.Layer',
        body: {
          options: {
            color: [220, 102, 153],
          },
          'coverage-options': {
            opacity: 0.3,
            color: '#f69',
          },
          'css-url':
            'https://github.com/Vizzuality/gfw/blob/develop/app/assets/javascripts/map/cartocss/style.cartocss',
          url: DATASET_URLS.UMD_GLAD_TILES,
          useCors: true,
          metadata: 'umd_landsat_alerts',
        },
      },
      legendConfig: {
        items: [
          {
            categories: [
              {
                name: 'Geographic coverage',
                color: '#f69',
              },
            ],
            name: 'Landsat Integrated Alerts Geographic Coverage',
            source: '(weekly, 30m, select countries, UMD/GLAD)',
            color: '#dc6699',
          },
        ],
        type: 'basic',
      },
      interactionConfig: {},
      applicationConfig: {},
      staticImageConfig: {},
      createdAt: '2023-11-28T21:44:34.848Z',
      updatedAt: '2023-12-11T15:11:07.233Z',
    },
  },
];
