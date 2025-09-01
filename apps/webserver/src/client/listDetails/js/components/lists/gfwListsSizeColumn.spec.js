import gfwListsSizeColumn from './gfwListsSizeColumn';
import { checkValid, formatDigit } from '../../../../locations/js/utils/locationsTableUtils';

// Mock dependencies
jest.mock('../../../../locations/js/utils/locationsTableUtils', () => ({
  checkValid: jest.fn(),
  formatDigit: jest.fn((value) => value),
}));

jest.mock('../../../../../config/env/gfwLists.constants', () => ({
  GFW_LISTS_NUMBER_CONSTANTS: {
    PALM_OIL_MILLS: 1,
    PROTECTED_AREAS: 2,
    CONCESSIONS: 3,
  },
}));

describe('gfwListsSizeColumn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty array for non-GFW list IDs', () => {
    const result = gfwListsSizeColumn(999);
    expect(result).toEqual([]);
  });

  it('should return size column for valid GFW list IDs', () => {
    const result = gfwListsSizeColumn(1);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'Size',
      Header: expect.any(Function),
      accessor: expect.any(Function),
      Cell: expect.any(Function),
      className: 'td-num',
      show: true,
    });
  });

  it('should render size header correctly', () => {
    const result = gfwListsSizeColumn(2);
    const header = result[0].Header();

    expect(header.type).toBe('span');
    expect(header.props.className).toBe('title-text');
  });

  it('should handle size accessor function', () => {
    const result = gfwListsSizeColumn(3);
    const accessor = result[0].accessor;
    const testData = { test: 'data' };

    expect(accessor(testData)).toBe(testData);
  });

  it('should render size cell with valid area', () => {
    checkValid.mockReturnValue(true);
    formatDigit.mockReturnValue('1,234.56');

    const result = gfwListsSizeColumn(1);
    const cell = result[0].Cell;
    const mockRow = { original: { total_area: 1234.56 } };

    const cellResult = cell(mockRow);

    expect(checkValid).toHaveBeenCalledWith(1234.56);
    expect(formatDigit).toHaveBeenCalledWith(1234.56);
    expect(cellResult).toBe('1,234.56');
  });

  it('should render size cell with invalid area', () => {
    checkValid.mockReturnValue(false);

    const result = gfwListsSizeColumn(1);
    const cell = result[0].Cell;
    const mockRow = { original: { total_area: null } };

    const cellResult = cell(mockRow);

    expect(checkValid).toHaveBeenCalledWith(null);
    expect(cellResult).toBe(0);
  });
});
