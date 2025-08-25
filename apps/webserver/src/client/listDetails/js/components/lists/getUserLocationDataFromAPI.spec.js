jest.mock('../../../../locations/js/store', () => ({
  getState: jest.fn(() => ({ listView: 'FOREST_CHANGE_VIEW' })),
}));

// Mock list view constants used by the module
jest.mock('./ListDetails/listViews.constants', () => ({
  COMMODITY_RISK_VIEW: 'COMMODITY_RISK_VIEW',
  FOREST_CHANGE_VIEW: 'FOREST_CHANGE_VIEW',
  POST_2020_RISK_ASSESSMENT_VIEW: 'POST_2020_RISK_ASSESSMENT_VIEW',
}));

// Mock analysisTypes constants
jest.mock('../../../../../config/env/analysisTypes.constants', () => ({
  analysisTypes: {
    FOREST_CHANGE_DIAGNOSTICS: 'FCD',
    DEFORESTATION_KPIS: 'DKP',
  },
}));

// Set up axios mock with create() returning a callable instance
jest.mock('axios', () => {
  const mockInstance = jest.fn();
  const mockCreate = jest.fn(() => mockInstance);
  const axios = { create: mockCreate };
  // expose for test assertions/configuration
  axios.__instance = mockInstance;
  axios.__create = mockCreate;
  return axios;
});

// Mock axios-retry and expose helpers used by the module under test
jest.mock('axios-retry', () => {
  const fn = jest.fn();
  fn.exponentialDelay = Symbol('exp-delay');
  fn.isNetworkOrIdempotentRequestError = jest.fn().mockReturnValue(false);
  return fn;
});

describe('getUserLocationDataFromAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    // default store value
    const store = require('../../../../locations/js/store');
    store.getState.mockReturnValue({ listView: 'FOREST_CHANGE_VIEW' });
  });

  const getModule = () => require('./getUserLocationDataFromAPI').default;

  it('calls axios with correct params and returns response data', async () => {
    const axios = require('axios');
    const getUserLocationDataFromAPI = getModule();

    axios.__instance.mockResolvedValueOnce({ data: { rows: [1, 2] } });

    const filters = {
      selectedAreaMin: 0,
      selectedCountry: 'ID',
      selectedState: 'JK',
      selectedSubState: '01',
      hasError: true,
      selectedSupplier: 'SupplierA',
      selectedSecondSupplier: 'SupplierB',
      selectedParentCompany: 'ParentCo',
      showRSPOCertified: true,
      selectedOverallThreats: ['High'],
      selectedOverallValues: ['Value1'],
      selectedMillPriority: ['P1'],
    };

    const result = await getUserLocationDataFromAPI(
      filters,
      [10, 20],
      'search-term',
      'name',
      true,
      0,
      false
    );

    expect(result).toEqual({ rows: [1, 2] });

    const axiosRetry = require('axios-retry');
    expect(axios.__create).toHaveBeenCalledTimes(1);
    expect(axiosRetry).toHaveBeenCalledTimes(1);

    // axios was called with the expected request config
    expect(axios.__instance).toHaveBeenCalledTimes(1);
    const config = axios.__instance.mock.calls[0][0];
    expect(config.url).toBe('/locations/getListsPaginated');
    expect(config.method).toBe('GET');
    expect(config.credentials).toBe('same-origin');
    expect(config.headers).toEqual({ 'Content-type': 'application/json' });

    expect(config.params).toMatchObject({
      pageSize: 50,
      page: 1,
      areAllAnalysesDraft: false,
      listID: [10, 20],
      searchString: 'search-term',
      sortByAttribute: 'name',
      order: 'desc',
      analysisAreaMin: 0,
      analysisId: 'FCD',
      country: 'ID',
      state: 'JK',
      subState: '01',
      hasError: true,
      selectedSupplier: 'SupplierA',
      selectedSecondSupplier: 'SupplierB',
      selectedParentCompany: 'ParentCo',
      showRSPOCertified: true,
      selectedOverallThreats: ['High'],
      selectedOverallValues: ['Value1'],
      selectedMillPriority: ['P1'],
    });
    expect(Object.prototype.hasOwnProperty.call(config.params, 'analysisAreaMax')).toBe(false);
  });

  it('uses DEFORESTATION_KPIS analysisId for POST_2020_RISK_ASSESSMENT_VIEW', async () => {
    const store = require('../../../../locations/js/store');
    store.getState.mockReturnValue({ listView: 'POST_2020_RISK_ASSESSMENT_VIEW' });

    const axios = require('axios');
    const getUserLocationDataFromAPI = getModule();
    axios.__instance.mockResolvedValueOnce({ data: { ok: true } });

    await getUserLocationDataFromAPI({}, [1], '', 'id', false, 2, true);

    const axios2 = require('axios');
    const config = axios2.__instance.mock.calls[0][0];
    expect(config.params.analysisId).toBe('DKP');
    expect(config.params.page).toBe(3); // page is 1-based
    expect(config.params.areAllAnalysesDraft).toBe(true);
  });

  it('configures axios-retry with expected options and condition', () => {
    getModule();

    const axiosRetry = require('axios-retry');
    expect(axiosRetry).toHaveBeenCalledTimes(1);
    const [client, options] = axiosRetry.mock.calls[0];
    expect(typeof client).toBe('function');
    expect(options.retries).toBe(3);
    expect(options.retryDelay).toBe(axiosRetry.exponentialDelay);

    // 429 should be retried
    expect(options.retryCondition({ response: { status: 429 } })).toBe(true);

    // Non-429 should defer to isNetworkOrIdempotentRequestError
    const axiosRetry2 = require('axios-retry');
    axiosRetry2.isNetworkOrIdempotentRequestError.mockReturnValueOnce(true);
    expect(options.retryCondition({})).toBe(true);

    axiosRetry2.isNetworkOrIdempotentRequestError.mockReturnValueOnce(false);
    expect(options.retryCondition({ response: { status: 500 } })).toBe(false);
  });

  it('uses FCD for COMMODITY_RISK_VIEW and sets order asc when sortedDesc is false', async () => {
    const store = require('../../../../locations/js/store');
    store.getState.mockReturnValue({ listView: 'COMMODITY_RISK_VIEW' });

    const axios = require('axios');
    const getUserLocationDataFromAPI = getModule();
    axios.__instance.mockResolvedValueOnce({ data: { ok: true } });

    await getUserLocationDataFromAPI(
      { selectedAreaMax: 123 },
      [99],
      'q',
      'id',
      false, // tableSortedDesc -> order asc
      1,
      false
    );

    const cfg = axios.__instance.mock.calls[0][0];
    expect(cfg.params.analysisId).toBe('FCD');
    expect(cfg.params.order).toBe('asc');
    expect(cfg.params.analysisAreaMax).toBe(123);
  });

  it('omits optional commodity fields when not provided and defaults analysisAreaMin to 0', async () => {
    const axios = require('axios');
    const getUserLocationDataFromAPI = getModule();
    axios.__instance.mockResolvedValueOnce({ data: {} });

    const filters = {
      // intentionally empty/undefined/falsey
      selectedSupplier: undefined,
      selectedSecondSupplier: undefined,
      selectedParentCompany: undefined,
      showRSPOCertified: undefined,
      selectedOverallThreats: [],
      selectedOverallValues: [],
      selectedMillPriority: [],
    };

    await getUserLocationDataFromAPI(filters, [1], '', 'id', false, 0, false);

    const cfg = axios.__instance.mock.calls[0][0];
    const p = cfg.params;
    expect(p.analysisAreaMin).toBe(0);
    expect('selectedSupplier' in p).toBe(false);
    expect('selectedSecondSupplier' in p).toBe(false);
    expect('selectedParentCompany' in p).toBe(false);
    expect('showRSPOCertified' in p).toBe(false);
    expect('selectedOverallThreats' in p).toBe(false);
    expect('selectedOverallValues' in p).toBe(false);
    expect('selectedMillPriority' in p).toBe(false);
  });

  it('propagates non-retryable axios errors', async () => {
    const axios = require('axios');
    const getUserLocationDataFromAPI = getModule();
    const error = { response: { status: 500 } };
    axios.__instance.mockRejectedValueOnce(error);

    await expect(
      getUserLocationDataFromAPI({}, [1], '', 'id', false, 0, false)
    ).rejects.toBe(error);
  });
});


