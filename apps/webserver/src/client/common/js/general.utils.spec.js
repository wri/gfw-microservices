/**
 * @jest-environment jsdom
 */

/* eslint-disable global-require */

jest.mock('../../../utils/getFeatureFlags', () => jest.fn());

describe('featureFlags Proxy', () => {
  let warnSpy;

  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('returns the flag value for a valid JSON blob', () => {
    localStorage.setItem('featureFlags', JSON.stringify({ MyFlag: true }));
    const featureFlags = require('../../../utils/general.utils').default;
    expect(featureFlags.MyFlag).toBe(true);
  });

  it('returns undefined and logs a warning when localStorage contains invalid JSON', () => {
    localStorage.setItem('featureFlags', 'not-json');
    const featureFlags = require('../../../utils/general.utils').default;

    expect(featureFlags.AnyFlag).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      'Failed to parse featureFlags from localStorage',
      expect.any(Error)
    );
  });

  it('returns undefined when the key is missing (no warning)', () => {
    const featureFlags = require('../../../utils/general.utils').default;
    expect(featureFlags.Missing).toBeUndefined();
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
