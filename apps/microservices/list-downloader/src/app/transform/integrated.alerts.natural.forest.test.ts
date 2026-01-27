import { IntegratedAlertsNaturalForest } from './integrated.alerts.natural.forest'; // Adjust the path accordingly

describe('IntegratedAlertsNaturalForest', () => {
  const startDate = '2021-09-01';
  const endDate = '2023-03-01';
  const listName = 'List 1';

  it('should handle input without the fields', (done) => {
    const jsonData = {};
    const transformStream = new IntegratedAlertsNaturalForest(listName, startDate, endDate);

    transformStream._transform(jsonData, 'utf-8', (output) => {
      expect(output).toEqual([]);
      done();
    });
  });

  it('should handle one column without a specific date', (done) => {
    const jsonData = {
      location_name: 'Location 1',
      totalHa: 25710.12,
      integratedAlertsDailyAllNominal: '{"2021-09-17":6}',
      integratedAlertsDailySbtnNominal: '{"2021-09-17":3}',
      integratedAlertsDailyJrcNominal: '{}',
      integratedAlertsDailyAllHigh: '{"2021-09-17":5}',
      integratedAlertsDailySbtnHigh: '{"2021-09-17":2}',
      integratedAlertsDailyJrcHigh: '{"2021-09-17":1}',
      integratedAlertsDailyAllHighest: '{}',
      integratedAlertsDailySbtnHighest: '{}',
      integratedAlertsDailyJrcHighest: '{}',
    };
    const transformStream = new IntegratedAlertsNaturalForest(listName, startDate, endDate);

    transformStream._transform(jsonData, 'utf-8', (_, output) => {
      expect(output).toEqual([
        [
          'List 1',
          'Location 1',
          'Deforestation (Integrated Alerts)',
          '2021-09-01',
          '2023-03-01',
          '2021-09-17',
          25710.12,
          'Nominal',
          6,
          3,
          0,
          1,
        ],
        [
          'List 1',
          'Location 1',
          'Deforestation (Integrated Alerts)',
          '2021-09-01',
          '2023-03-01',
          '2021-09-17',
          25710.12,
          'High',
          5,
          2,
          1,
          1,
        ],
      ]);
      done();
    });
  });

  it('should handle one group without data', (done) => {
    const jsonData = {
      location_name: 'Location 1',
      totalHa: 100,
      integratedAlertsDailyAllNominal: '{}',
      integratedAlertsDailySbtnNominal: '{}',
      integratedAlertsDailyJrcNominal: '{}',
      integratedAlertsDailyAllHigh: '{"2021-09-17":5}',
      integratedAlertsDailySbtnHigh: '{"2021-09-17":2}',
      integratedAlertsDailyJrcHigh: '{"2021-09-17":1}',
      integratedAlertsDailyAllHighest: '{}',
      integratedAlertsDailySbtnHighest: '{}',
      integratedAlertsDailyJrcHighest: '{}',
    };
    const transformStream = new IntegratedAlertsNaturalForest(listName, startDate, endDate);

    transformStream._transform(jsonData, 'utf-8', (_, output) => {
      expect(output).toEqual([
        [
          'List 1',
          'Location 1',
          'Deforestation (Integrated Alerts)',
          '2021-09-01',
          '2023-03-01',
          '2021-09-17',
          100,
          'High',
          5,
          2,
          1,
          1,
        ],
      ]);
      done();
    });
  });

  it('should handle input with all data', (done) => {
    const jsonData = {
      location_name: 'Location 1',
      totalHa: 200,
      integratedAlertsDailyAllNominal: '{"2021-09-17":6}',
      integratedAlertsDailySbtnNominal: '{"2021-09-17":3}',
      integratedAlertsDailyJrcNominal: '{"2021-09-17":1}',
      integratedAlertsDailyAllHigh: '{"2021-09-17":5}',
      integratedAlertsDailySbtnHigh: '{"2021-09-17":2}',
      integratedAlertsDailyJrcHigh: '{"2021-09-17":1}',
      integratedAlertsDailyAllHighest: '{"2021-09-17":4}',
      integratedAlertsDailySbtnHighest: '{"2021-09-17":2}',
      integratedAlertsDailyJrcHighest: '{"2021-09-17":1}',
    };
    const transformStream = new IntegratedAlertsNaturalForest(listName, startDate, endDate);

    transformStream._transform(jsonData, 'utf-8', (_, output) => {
      expect(output).toEqual([
        [
          'List 1',
          'Location 1',
          'Deforestation (Integrated Alerts)',
          '2021-09-01',
          '2023-03-01',
          '2021-09-17',
          200,
          'Nominal',
          6,
          3,
          1,
          1,
        ],
        [
          'List 1',
          'Location 1',
          'Deforestation (Integrated Alerts)',
          '2021-09-01',
          '2023-03-01',
          '2021-09-17',
          200,
          'High',
          5,
          2,
          1,
          1,
        ],
        [
          'List 1',
          'Location 1',
          'Deforestation (Integrated Alerts)',
          '2021-09-01',
          '2023-03-01',
          '2021-09-17',
          200,
          'Highest',
          4,
          2,
          1,
          1,
        ],
      ]);
      done();
    });
  });

  it('should handle when dont have data on specific date range', (done) => {
    const jsonData = {
      location_name: 'Location 1',
      integratedAlertsDailyAllNominal: '{"2021-09-17":6}',
      integratedAlertsDailySbtnNominal: '{"2021-09-17":3}',
      integratedAlertsDailyJrcNominal: '{"2021-09-17":1}',
      integratedAlertsDailyAllHigh: '{"2021-09-17":5}',
      integratedAlertsDailySbtnHigh: '{"2021-09-17":2}',
      integratedAlertsDailyJrcHigh: '{"2021-09-17":1}',
      integratedAlertsDailyAllHighest: '{"2021-09-17":4}',
      integratedAlertsDailySbtnHighest: '{"2021-09-17":2}',
      integratedAlertsDailyJrcHighest: '{"2021-09-17":1}',
    };
    const transformStream = new IntegratedAlertsNaturalForest(listName, '2023-01-01', '2023-03-01');

    transformStream._transform(jsonData, 'utf-8', (_, output) => {
      expect(output).toEqual([]);
      done();
    });
  });
});
