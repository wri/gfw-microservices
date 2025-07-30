import { deduceActiveId } from './templateUtils';

describe('deduceActiveId', () => {
  it('should return the correct template ID for palmMill', () => {
    expect(deduceActiveId('palmMill')).toBe(2);
  });

  it('should return the correct template ID for palmPlantation', () => {
    expect(deduceActiveId('palmPlantation')).toBe(3);
  });

  it('should return the correct template ID for palmFarm', () => {
    expect(deduceActiveId('palmFarm')).toBe(4);
  });

  it('should return the correct template ID for palmGeneric', () => {
    expect(deduceActiveId('palmGeneric')).toBe(5);
  });

  it('should return the correct template ID for soySilo', () => {
    expect(deduceActiveId('soySilo')).toBe(6);
  });

  it('should return the correct template ID for soyFarm', () => {
    expect(deduceActiveId('soyFarm')).toBe(7);
  });

  it('should return the correct template ID for soyGeneric', () => {
    expect(deduceActiveId('soyGeneric')).toBe(8);
  });

  it('should return the correct template ID for beef', () => {
    expect(deduceActiveId('beef')).toBe(9);
  });

  it('should return the correct template ID for cattle', () => {
    expect(deduceActiveId('cattle')).toBe(10);
  });

  it('should return the correct template ID for cattleGeneric', () => {
    expect(deduceActiveId('cattleGeneric')).toBe(11);
  });

  it('should return the correct template ID for cocoa', () => {
    expect(deduceActiveId('cocoa')).toBe(12);
  });

  it('should return the correct template ID for cocoaGeneric', () => {
    expect(deduceActiveId('cocoaGeneric')).toBe(13);
  });

  it('should return the correct template ID for other', () => {
    expect(deduceActiveId('other')).toBe(14);
  });

  it('should return the correct template ID for generic', () => {
    expect(deduceActiveId('generic')).toBe(14);
  });

  it('should return the correct template ID for investment', () => {
    expect(deduceActiveId('investment')).toBe(1);
  });

  it('should return 1 for unknown template', () => {
    expect(deduceActiveId('unknown')).toBe(1);
  });
});
