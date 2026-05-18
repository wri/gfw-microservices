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
      ['List Name', 'Data Layer', 'Sub-Layer', 'Overlap with Sub-Layer (%)'],
    ]);
  });

  test('Receive an input with just one biome', () => {
    const returnData = southAmericaBiomesService.generateAggregate(
      'sAmericaBiomesAggregate',
      'south_america_brazil_biomes_aggregate',
      { brazil_biomes: '{"cerrado": 70}' }
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer', 'Sub-Layer', 'Overlap with Sub-Layer (%)'],
      ['south_america_brazil_biomes_aggregate', 'Brazil Biomes', 'cerrado', '100.00'],
    ]);
  });

  test('Receive an input with two biomes', () => {
    const returnData = southAmericaBiomesService.generateAggregate(
      'sAmericaBiomesAggregate',
      'south_america_brazil_biomes_aggregate',
      { brazil_biomes: '{"cerrado": 50, "amazonia": 70}' }
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer', 'Sub-Layer', 'Overlap with Sub-Layer (%)'],
      ['south_america_brazil_biomes_aggregate', 'Brazil Biomes', 'cerrado', '41.67'],
      ['south_america_brazil_biomes_aggregate', 'Brazil Biomes', 'amazonia', '58.33'],
    ]);
  });

  test('Receive an empty analysis data', () => {
    const returnData = southAmericaBiomesService.generateAggregate(
      'sAmericaBiomesAggregate',
      'south_america_brazil_biomes_aggregate',
      {}
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer', 'Sub-Layer', 'Overlap with Sub-Layer (%)'],
    ]);
  });

  test('Receive an undefined analysis data', () => {
    const returnData = southAmericaBiomesService.generateAggregate(
      'sAmericaBiomesAggregate',
      'south_america_brazil_biomes_aggregate',
      undefined
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer', 'Sub-Layer', 'Overlap with Sub-Layer (%)'],
    ]);
  });

  test('Receive a property with null', () => {
    const returnData = southAmericaBiomesService.generateAggregate(
      'sAmericaBiomesAggregate',
      'south_america_brazil_biomes_aggregate',
      {}
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer', 'Sub-Layer', 'Overlap with Sub-Layer (%)'],
    ]);
  });

  test('Receive classified_region_area with ARG envelope and emit Argentina OTBN rows', () => {
    const returnData = southAmericaBiomesService.generateAggregate(
      'sAmericaBiomesAggregate',
      'south_america_overlap_aggregate',
      {
        classified_region_area: '{"ARG":{"Category I":2488.1641,"Category II":315.7406}}',
      }
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer', 'Sub-Layer', 'Overlap with Sub-Layer (%)'],
      ['south_america_overlap_aggregate', 'Argentina OTBN', 'Category I', '88.74'],
      ['south_america_overlap_aggregate', 'Argentina OTBN', 'Category II', '11.26'],
    ]);
  });

  test('Receive both brazil_biomes and classified_region_area and emit rows for each', () => {
    const returnData = southAmericaBiomesService.generateAggregate(
      'sAmericaBiomesAggregate',
      'south_america_overlap_aggregate',
      {
        brazil_biomes: '{"Amazônia":100}',
        classified_region_area: '{"ARG":{"Category I":50}}',
      }
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer', 'Sub-Layer', 'Overlap with Sub-Layer (%)'],
      ['south_america_overlap_aggregate', 'Brazil Biomes', 'Amazônia', '100.00'],
      ['south_america_overlap_aggregate', 'Argentina OTBN', 'Category I', '100.00'],
    ]);
  });
});
