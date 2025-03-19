import { getCommodityName } from './list-utils';

describe('getCommodityName', () => {
  it('should return the correct name for default commodities', () => {
    expect(getCommodityName('GFWP_Cattle')).toBe('Cattle');
    expect(getCommodityName('COCO')).toBe('Cocoa');
    expect(getCommodityName('COFF')).toBe('Coffee');
    expect(getCommodityName('OILP')).toBe('Palm Oil');
    expect(getCommodityName('GFWP_Pulp_and_paper')).toBe('Pulp and paper');
    expect(getCommodityName('RUBB')).toBe('Rubber');
    expect(getCommodityName('SOYB')).toBe('Soy');
    expect(getCommodityName('SUGC')).toBe('Sugar Cane');
    expect(getCommodityName('GFWP_Multiple')).toBe('Multiple');
  });

  it('should return the correct name for custom commodity"', () => {
    expect(getCommodityName('GFWP_Tést_commodity')).toBe('Tést commodity');
  });

  it('should return empty string when commodity is undefined, null or empty', () => {
    expect(getCommodityName(undefined)).toBe('');
    expect(getCommodityName(null)).toBe('');
    expect(getCommodityName('')).toBe('');
  });

  it('should return the empty string if its an invalid value', () => {
    expect(getCommodityName('UNKNOWN_COMMODITY')).toBe('');
  });
});
