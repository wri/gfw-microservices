import { GlobalIntegratedDisturbanceAlertsDaily } from './global.integrated.disturbance.alerts.daily';

describe('GlobalIntegratedDisturbanceAlertsDaily', () => {
  const listName = 'TestList';
  const startDate = '2021-01-01';
  const endDate = '2021-01-02';

  it('should return empty array for empty chunk', (done) => {
    const transform = new GlobalIntegratedDisturbanceAlertsDaily(listName, startDate, endDate);

    transform._transform({}, 'utf-8', (err, output) => {
      expect(err).toBeNull();
      expect(output).toEqual([]);
      done();
    });
  });

  it('should convert alert counts to hectares and return ordered rows', (done) => {
    const transform = new GlobalIntegratedDisturbanceAlertsDaily(listName, startDate, endDate);
    const chunk = {
      location_name: 'Location A',
      totalHa: 200,
      Country: 'CountryX',
      State: 'StateY',
      'Sub State': 'SubZ',
      integratedAlertsDailyAllNominal: '{"2021-01-01":2,"2021-01-02":1}',
      integratedAlertsDailySbtnNominal: '{"2021-01-01":1,"2021-01-02":0}',
      integratedAlertsDailyJrcNominal: '{"2021-01-01":0,"2021-01-02":1}',
      integratedAlertsDailyAllHigh: '{"2021-01-01":0,"2021-01-02":3}',
      integratedAlertsDailySbtnHigh: '{"2021-01-01":0,"2021-01-02":2}',
      integratedAlertsDailyJrcHigh: '{"2021-01-01":0,"2021-01-02":1}',
      integratedAlertsDailyAllHighest: '{"2021-01-01":4}',
      integratedAlertsDailySbtnHighest: '{"2021-01-01":2}',
      integratedAlertsDailyJrcHighest: '{"2021-01-01":1}',
    };

    transform._transform(chunk, 'utf-8', (err, output) => {
      expect(err).toBeNull();
      expect(output).toEqual([
        [
          'TestList_Global_Integrated_Disturbance_Alerts_Daily',
          'Location A',
          200,
          'CountryX',
          'StateY',
          'SubZ',
          'Global Integrated Disturbance Alert',
          '2021-01-01',
          '2021-01-02',
          '2021-01-01',
          'Nominal',
          0.18,
          0.09,
          0,
          0,
          1,
        ],
        [
          'TestList_Global_Integrated_Disturbance_Alerts_Daily',
          'Location A',
          200,
          'CountryX',
          'StateY',
          'SubZ',
          'Global Integrated Disturbance Alert',
          '2021-01-01',
          '2021-01-02',
          '2021-01-01',
          'Highest',
          0.36,
          0.18,
          0,
          0.09,
          1,
        ],
        [
          'TestList_Global_Integrated_Disturbance_Alerts_Daily',
          'Location A',
          200,
          'CountryX',
          'StateY',
          'SubZ',
          'Global Integrated Disturbance Alert',
          '2021-01-01',
          '2021-01-02',
          '2021-01-02',
          'Nominal',
          0.09,
          0,
          0,
          0.09,
          1,
        ],
        [
          'TestList_Global_Integrated_Disturbance_Alerts_Daily',
          'Location A',
          200,
          'CountryX',
          'StateY',
          'SubZ',
          'Global Integrated Disturbance Alert',
          '2021-01-01',
          '2021-01-02',
          '2021-01-02',
          'High',
          0.27,
          0.18,
          0,
          0.09,
          1,
        ],
      ]);
      done();
    });
  });
});
