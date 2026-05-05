import { BasicFieldsFileRequest } from '@wri-monorepos/sql';
import { getDownloadFilename } from './download-filename';

describe('getDownloadFilename', () => {
  const cases: Array<[BasicFieldsFileRequest, string]> = [
    [{ type: 'input', listName: 'My List' }, 'My List_input.zip'],
    [{ type: 'input', source: 'landing', listName: 'Acme' }, 'Acme_input.zip'],
    [{ type: 'input', source: 'listDetails', listName: 'Acme' }, 'Acme_input.zip'],
    [{ type: 'results', listName: 'Acme' }, 'Acme_results.zip'],
    [{ type: 'afi', listName: 'Acme' }, 'Acme_deforestation_kpis.zip'],
    [{ type: 'afiVC', listName: 'Acme' }, 'Acme_deforestation_kpis.zip'],
    [{ type: 'alerts', listName: 'Acme' }, 'Acme_alerts.zip'],
    [{ type: 'ghg', listName: 'Acme' }, 'Acme_ghg.zip'],
    [
      { type: 'everything', listView: 'forest_change', listName: 'Acme' },
      'Acme_forest_change_analysis.zip',
    ],
    [
      { type: 'everything', listView: 'commodity_risk', listName: 'Acme' },
      'Acme_palm_risk_analysis.zip',
    ],
    [
      { type: 'palmRiskAnalysis', listView: 'commodity_risk', listName: 'Acme' },
      'Acme_palm_risk_analysis.zip',
    ],
    [
      { type: 'forestLoss', listView: 'forest_change', listName: 'Acme' },
      'Acme_forest_change_analysis.zip',
    ],
  ];

  it.each(cases)('%j should produce %s', (filters, expected) => {
    expect(getDownloadFilename(filters)).toBe(expected);
  });

  it('falls back to listName.zip for unmapped type with no listView', () => {
    expect(getDownloadFilename({ type: 'unknown', listName: 'Acme' })).toBe('Acme.zip');
  });

  it('falls back to "list" when listName is missing', () => {
    expect(getDownloadFilename({ type: 'input' })).toBe('list_input.zip');
  });

  it('preserves spaces and unicode in listName', () => {
    expect(getDownloadFilename({ type: 'input', listName: 'Test List Café' })).toBe(
      'Test List Café_input.zip'
    );
  });

  it('strips control characters and trims surrounding whitespace', () => {
    const tab = String.fromCharCode(9);
    const newline = String.fromCharCode(10);
    expect(getDownloadFilename({ type: 'input', listName: `  Acme${tab}${newline}  ` })).toBe(
      'Acme_input.zip'
    );
  });
});
