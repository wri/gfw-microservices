import { SouthAmericaBiomesService } from './south.america.biomes.service';

describe('South America Biomes Service', () => {
  let southAmericaBiomesService: SouthAmericaBiomesService;

  beforeEach(() => {
    southAmericaBiomesService = new SouthAmericaBiomesService();
  });

  test('Receive an empty input and return just the header', () => {
    const returnData = southAmericaBiomesService.generateAggregate(
      'sAmericaBiomesAggregate',
      'south_america_brazil_biomes_aggregate',
      { brazil_biomes: '{}' }
    );
    expect(returnData).toEqual([
      ['List Name', 'Brazil Biome', 'Overlap with Brazil Biome (%)'],
    ]);
  });

  test('Receive an input with just one biome', () => {
    const returnData = southAmericaBiomesService.generateAggregate(
      'sAmericaBiomesAggregate',
      'south_america_brazil_biomes_aggregate',
      { brazil_biomes: '{"cerrado": 70}' }
    );
    expect(returnData).toEqual([
      ['List Name', 'Brazil Biome', 'Overlap with Brazil Biome (%)'],
      ['south_america_brazil_biomes_aggregate', 'cerrado', '100.00'],
    ]);
  });

  test('Receive an input with two biomes', () => {
    const returnData = southAmericaBiomesService.generateAggregate(
      'sAmericaBiomesAggregate',
      'south_america_brazil_biomes_aggregate',
      { brazil_biomes: '{"cerrado": 50, "amazonia": 70}' }
    );
    expect(returnData).toEqual([
      ['List Name', 'Brazil Biome', 'Overlap with Brazil Biome (%)'],
      ['south_america_brazil_biomes_aggregate', 'cerrado', '41.67'],
      ['south_america_brazil_biomes_aggregate', 'amazonia', '58.33'],
    ]);
  });
});
