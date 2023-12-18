import {
  afiDiagnosticsChartsColors,
  afiDiagnosticsCategories,
} from '../../js/AfiDiagnostics/afiDiagnosticsChartsColors.constants';

test('afiDiagnosticsChartsColors should be defined correctly', () => {
  expect(afiDiagnosticsChartsColors).toEqual({
    negligibleRisk: '#82a13a',
    nonNegligibleRisk: '#9ebc52',
  });
});

test('afiDiagnosticsCategories should be defined correctly', () => {
  expect(afiDiagnosticsCategories).toEqual(['Negligible Risk', 'Non Negligible Risk']);
});
