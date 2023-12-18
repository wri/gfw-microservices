import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AfiDiagnostics from '../../js/AfiDiagnostics/index';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
);

beforeAll(()=> {
    window.gtag = function() {}
})

test('renders loading spinner initially', () => {
  render(<AfiDiagnostics />);
  const loadingSpinner = screen.getByTestId('loading-spinner');
  expect(loadingSpinner).toBeInTheDocument();
});

test('renders content after data is loaded', async () => {
  render(<AfiDiagnostics />);

  fetch.mockReturnValueOnce(
    Promise.resolve({
      json: () => Promise.resolve({ regionalInfo: {}, negligibleRiskStats: {} }),
    })
  );

  await waitFor(() => {
    const diagnosticsMenuBar = screen.getByText('DiagnosticsMenuBar');
    const diagnosticsBreadCrumbs = screen.getByText('DiagnosticsBreadCrumbs');
    const afiDiagnosticsTable = screen.getByText('AfiDiagnosticsTable');
    const afiPieChart = screen.getByText('AfiPieChart');

    expect(diagnosticsMenuBar).toBeInTheDocument();
    expect(diagnosticsBreadCrumbs).toBeInTheDocument();
    expect(afiDiagnosticsTable).toBeInTheDocument();
    expect(afiPieChart).toBeInTheDocument();
  });
});
