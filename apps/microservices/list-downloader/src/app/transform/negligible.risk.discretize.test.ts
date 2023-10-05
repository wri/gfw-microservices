import { NegligibleRiskDiscretize } from './negligible.risk.discretize';

describe('NegligibleRiskDiscretize', () => {
  test('Should not break when do not have the negligible risk', () => {
    const negligibleRiskDiscretize = new NegligibleRiskDiscretize();
    negligibleRiskDiscretize._transform({}, '', (err, data) => {
      expect(data).toEqual({});
    });
  });

  test('Should not break when receive undefined', () => {
    const negligibleRiskDiscretize = new NegligibleRiskDiscretize();
    negligibleRiskDiscretize._transform(undefined, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });

  test('Should return negligible risk as yes', () => {
    const negligibleRiskDiscretize = new NegligibleRiskDiscretize();
    negligibleRiskDiscretize._transform(
      {
        negligibleRisk: 0.8,
      },
      '',
      (err, data) => {
        expect(data).toEqual({
          negligibleRisk: 'yes',
        });
      }
    );
  });

  test('Should return negligible risk as no', () => {
    const negligibleRiskDiscretize = new NegligibleRiskDiscretize();
    negligibleRiskDiscretize._transform(
      {
        negligibleRisk: 0.4,
      },
      '',
      (err, data) => {
        expect(data).toEqual({
          negligibleRisk: 'no',
        });
      }
    );
  });
});
