import { OverlapPercentageColumns } from './overlap.percentage.columns';

describe('OverlapPercentageColumns', () => {
  let transformer: OverlapPercentageColumns;

  beforeEach(() => {
    transformer = new OverlapPercentageColumns(
      [
        { target: 'protectedAreasAreaPercentage', from: 'protectedAreasArea' },
        { target: 'landmarkAreaPercentage', from: 'landmarkArea' },
      ],
      'totalAreaHA'
    );
  });

  test('should calculate percentages correctly and add them to the chunk', (done) => {
    const inputChunk = {
      totalAreaHA: 100,
      protectedAreasArea: 25,
      landmarkArea: 50,
    };

    const expectedOutputChunk = {
      totalAreaHA: 100,
      protectedAreasArea: 25,
      landmarkArea: 50,
      protectedAreasAreaPercentage: '25.00',
      landmarkAreaPercentage: '50.00',
    };

    transformer._transform(inputChunk, '', (err, data) => {
      expect(data).toEqual(expectedOutputChunk);
      done();
    });
  });

  test('should set percentage to "0.00" if total is missing', (done) => {
    const inputChunk = {
      protectedAreasArea: 25,
      landmarkArea: 50,
    };

    const expectedOutputChunk = {
      protectedAreasArea: 25,
      landmarkArea: 50,
      protectedAreasAreaPercentage: 0,
      landmarkAreaPercentage: 0,
    };

    transformer._transform(inputChunk, '', (err, data) => {
      expect(data).toEqual(expectedOutputChunk);
      done();
    });
  });

  test('should set percentage to "0.00" if value is missing', (done) => {
    const inputChunk = {
      totalAreaHA: 100,
    };

    const expectedOutputChunk = {
      totalAreaHA: 100,
      protectedAreasAreaPercentage: 0,
      landmarkAreaPercentage: 0,
    };

    transformer._transform(inputChunk, '', (err, data) => {
      expect(data).toEqual(expectedOutputChunk);
      done();
    });
  });

  test('should handle null or undefined values gracefully', (done) => {
    const inputChunk = {
      totalAreaHA: 100,
      protectedAreasArea: null,
      landmarkArea: undefined,
    };

    const expectedOutputChunk = {
      totalAreaHA: 100,
      protectedAreasArea: null,
      landmarkArea: undefined,
      protectedAreasAreaPercentage: 0,
      landmarkAreaPercentage: 0,
    };

    transformer._transform(inputChunk, '', (err, data) => {
      expect(data).toEqual(expectedOutputChunk);
      done();
    });
  });
});
