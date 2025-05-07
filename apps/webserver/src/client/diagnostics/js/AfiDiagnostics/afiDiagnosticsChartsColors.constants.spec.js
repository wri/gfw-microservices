import {
  afiDiagnosticsChartsColors,
  afiDiagnosticsCategories,
} from './afiDiagnosticsChartsColors.constants';

test('afiDiagnosticsChartsColors should be defined correctly', () => {
  expect(afiDiagnosticsChartsColors).toEqual({
    negligibleRisk: '#de8500',
    nonNegligibleRisk: '#a40018',
  });
});

test('afiDiagnosticsCategories should be defined correctly', () => {
  expect(afiDiagnosticsCategories).toEqual(['Negligible Risk', 'Non Negligible Risk']);
});
