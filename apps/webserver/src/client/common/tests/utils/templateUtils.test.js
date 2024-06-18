import { deduceActiveName, deduceActiveId } from '../../js/utils/templateUtils';

describe('deduceActiveName', () => {
  it('should return the correct template name for palmMill', () => {
    expect(deduceActiveName('palmMill')).toBe('Palm Oil Mill');
  });

  it('should return the correct template name for palmPlantation', () => {
    expect(deduceActiveName('palmPlantation')).toBe('Palm Oil Plantation');
  });

  it('should return the correct template name for palmFarm', () => {
    expect(deduceActiveName('palmFarm')).toBe('Palm Smallholder Farm');
  });

  it('should return the correct template name for palmGeneric', () => {
    expect(deduceActiveName('palmGeneric')).toBe('Palm Oil Generic');
  });

  it('should return the correct template name for soySilo', () => {
    expect(deduceActiveName('soySilo')).toBe('Soy Silo');
  });

  it('should return the correct template name for soyFarm', () => {
    expect(deduceActiveName('soyFarm')).toBe('Soy Farm');
  });

  it('should return the correct template name for soyGeneric', () => {
    expect(deduceActiveName('soyGeneric')).toBe('Soy Generic');
  });

  it('should return the correct template name for beef', () => {
    expect(deduceActiveName('beef')).toBe('Beef Slaughterhouse');
  });

  it('should return the correct template name for cattle', () => {
    expect(deduceActiveName('cattle')).toBe('Cattle Ranch');
  });

  it('should return the correct template name for cattleGeneric', () => {
    expect(deduceActiveName('cattleGeneric')).toBe('Cattle Generic');
  });

  it('should return the correct template name for cocoa', () => {
    expect(deduceActiveName('cocoa')).toBe('Cocoa Farm');
  });

  it('should return the correct template name for cocoaGeneric', () => {
    expect(deduceActiveName('cocoaGeneric')).toBe('Cocoa Generic');
  });

  it('should return the correct template name for coffee', () => {
    expect(deduceActiveName('coffee')).toBe('Coffee');
  });

  it('should return the correct template name for rubber', () => {
    expect(deduceActiveName('rubber')).toBe('Rubber');
  });

  it('should return the correct template name for pulp', () => {
    expect(deduceActiveName('pulp')).toBe('Pulp and Paper');
  });

  it('should return the correct template name for soy', () => {
    expect(deduceActiveName('soy')).toBe('Soy');
  });

  it('should return the correct template name for sugarCane', () => {
    expect(deduceActiveName('sugarCane')).toBe('Sugar Cane');
  });

  it('should return the correct template name for other', () => {
    expect(deduceActiveName('other')).toBe('Other');
  });

  it('should return Other for unknown template', () => {
    expect(deduceActiveName('unknown')).toBe('Other');
  });
});

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
