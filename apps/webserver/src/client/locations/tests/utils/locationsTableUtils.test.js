import {
  sortAlphaNum,
  sortByStatus,
  sortByNone,
  locationIsActive,
  checkValid,
  numberWithCommas,
  sortOrderOption,
} from '../../js/utils/locationsTableUtils';
import { listStatus } from '../../../../config/env/listStatuses.constants';
import { ActiveLocationOne, PedingLocation } from '../mockedData';

describe('listStatus', () => {
  it('when Calls Pending return 1', () => {
    expect(listStatus.pending).toBe(1);
  });
  it('when Calls Active return 1', () => {
    expect(listStatus.active).toBe(2);
  });
  it('when Calls Inactive return 1', () => {
    expect(listStatus.inactive).toBe(3);
  });
  it('when Calls draft return 1', () => {
    expect(listStatus.draft).toBe(4);
  });
  it('when Calls analyzingDiagnostic return 1', () => {
    expect(listStatus.analyzingDiagnostic).toBe(5);
  });
  it('when Calls analyzingDashboard return 1', () => {
    expect(listStatus.analyzingDashboard).toBe(6);
  });
});

describe('sortAlphaNum', () => {
  const firstString = 'abc';
  const secondString = 'bcd';

  it('should return -1 if both string are the same', () => {
    const response = sortAlphaNum(firstString, firstString);
    expect(response).toBe(sortOrderOption.invert);
  });

  it('should return -1 if fisrtString come before', () => {
    const response = sortAlphaNum(firstString, secondString);
    expect(response).toBe(sortOrderOption.invert);
  });

  it('should return 1 if last String come before', () => {
    const response = sortAlphaNum(secondString, firstString);
    expect(response).toBe(sortOrderOption.keep);
  });
});

describe('sortByNone', () => {
  const noneValue = 'None';
  const firstValue = 123;
  const secondValue = 321;

  it('Should be 0 when both value are equal', () => {
    expect(sortByNone(noneValue, noneValue)).toBe(sortOrderOption.sameValue);
    expect(sortByNone(firstValue, firstValue)).toBe(sortOrderOption.sameValue);
  });

  it('Should be 1 when first value is none', () => {
    expect(sortByNone(noneValue, firstValue)).toBe(sortOrderOption.keep);
  });

  it('Should be -1 when first value is bigger', () => {
    expect(sortByNone(firstValue, secondValue)).toBe(sortOrderOption.invert);
  });

  it('Should be -1 when last value is none', () => {
    expect(sortByNone(firstValue, noneValue)).toBe(sortOrderOption.invert);
  });

  it('Should be 1 when second value is bigger', () => {
    expect(sortByNone(secondValue, firstValue)).toBe(sortOrderOption.keep);
  });
});

describe('sortByStatus', () => {
  it('should return area diference when both status are active', () => {
    const locationA = {
      location_status_id: listStatus.active,
    };
    const locationB = {
      location_status_id: listStatus.active,
    };
    const response = sortByStatus(locationA, locationB);
    expect(response).toBe(2);
  });

  it('should return 0 when both status locations are not active', () => {
    const a = {
      location_status_id: 3,
    };
    const b = {
      location_status_id: 4,
    };

    const response = sortByStatus(a, b);
    expect(response).toBe(sortOrderOption.sameValue);
  });

  it('should return 1 when just first status locations is active', () => {
    const a = {
      location_status_id: listStatus.active,
    };
    const b = {
      location_status_id: listStatus.pending,
    };

    const response = sortByStatus(a, b);
    expect(response).toBe(sortOrderOption.keep);
  });

  it('should return -1 when just second status locations is active', () => {
    const a = {
      location_status_id: listStatus.pending,
    };
    const b = {
      location_status_id: listStatus.active,
    };
    const response = sortByStatus(a, b);
    expect(response).toBe(sortOrderOption.invert);
  });
});

describe('locationIsActive', () => {
  it('should return true when location status is active', () => {
    expect(locationIsActive(ActiveLocationOne)).toBe(true);
  });

  it('should return false when location status is not active', () => {
    expect(locationIsActive(PedingLocation)).toBe(false);
  });
});

describe('checkValid', () => {
  it('Shuold return true when data is not empty', () => {
    expect(checkValid('asdf')).toBe(true);
  });

  it('Shuold return false when data is empty', () => {
    expect(checkValid('')).toBe(false);
    expect(checkValid(' ')).toBe(false);
    expect(checkValid('{}')).toBe(false);
    expect(checkValid(null)).toBe(false);
    expect(checkValid(undefined)).toBe(false);
  });
});

describe('numberWithCommas', () => {
  it('Shuold return number has a string with comas', () => {
    expect(numberWithCommas(100)).toBe('100');
    expect(numberWithCommas(1000)).toBe('1,000');
    expect(numberWithCommas(10000)).toBe('10,000');
    expect(numberWithCommas(1000000)).toBe('1,000,000');
  });
});
