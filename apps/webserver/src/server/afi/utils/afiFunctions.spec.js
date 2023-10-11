const { formatNegligibleRiskStatForChart } = require('./afiFunctions');

describe('Format Negligible Risk Stat For Chart', () => {
  it('Send undefined as input', () => {
    const formattedData = formatNegligibleRiskStatForChart(undefined);
    expect(formattedData).toEqual([
      {
        category: 'Negligible Risk',
        coverage: 0,
        id: 'negligibleRisk',
        totalAreaHA: 0,
      },
      {
        category: 'Non Negligible Risk',
        coverage: 100,
        id: 'nonNegligibleRisk',
        totalAreaHA: 0,
      },
    ]);
  });

  it('Send negligibleRisk and totalAreaHa as zero', () => {
    const formattedData = formatNegligibleRiskStatForChart({
      negligibleRisk: 0,
      totalAreaHa: 0,
    });

    console.log(formattedData);
    expect(formattedData).toEqual([
      {
        category: 'Negligible Risk',
        coverage: 0,
        id: 'negligibleRisk',
        totalAreaHA: 0,
      },
      {
        category: 'Non Negligible Risk',
        coverage: 100,
        id: 'nonNegligibleRisk',
        totalAreaHA: 0,
      },
    ]);
  });

  it('Send negligibleRisk as 10 and totalAreaHa as 90', () => {
    const formattedData = formatNegligibleRiskStatForChart({
      negligibleRisk: 10,
      totalAreaHa: 90,
    });

    expect(formattedData).toEqual([
      {
        category: 'Negligible Risk',
        coverage: 10,
        id: 'negligibleRisk',
        totalAreaHA: 9,
      },
      {
        category: 'Non Negligible Risk',
        coverage: 90,
        id: 'nonNegligibleRisk',
        totalAreaHA: 81,
      },
    ]);
  });
});
