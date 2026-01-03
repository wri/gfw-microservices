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

  it('should use area columns (hectares) and return ordered rows', (done) => {
    const transform = new GlobalIntegratedDisturbanceAlertsDaily(listName, startDate, endDate);
    const chunk = {
      location_name: 'Location A',
      totalHa: 200,
      Country: 'CountryX',
      State: 'StateY',
      'Sub State': 'SubZ',
      // Changed to numbers - SQL now returns pre-summed values
      integratedAlertsAreaAllNominal: 0.27, // Sum of 0.18 + 0.09
      integratedAlertsAreaSbtnNaturalForestsNominal: 0.09, // Sum of 0.09 + 0
      integratedAlertsAreaSbtnNaturalEcosystemNominal: 0,
      integratedAlertsAreaJrcNominal: 0.09, // Sum of 0 + 0.09
      integratedAlertsAreaAllHigh: 0.27, // Sum of 0 + 0.27
      integratedAlertsAreaSbtnNaturalForestsHigh: 0.18,
      integratedAlertsAreaSbtnNaturalEcosystemHigh: 0,
      integratedAlertsAreaJrcHigh: 0.09,
      integratedAlertsAreaAllHighest: 0.36,
      integratedAlertsAreaSbtnNaturalForestsHighest: 0.18,
      integratedAlertsAreaSbtnNaturalEcosystemHighest: 0,
      integratedAlertsAreaJrcHighest: 0.09,
    };

    transform._transform(chunk, 'utf-8', (err, output) => {
      expect(err).toBeNull();
      // Now returns single aggregated row per confidence level instead of per-day rows
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
          'all-time',
          'Nominal',
          0.27,
          0.09,
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
          'all-time',
          'High',
          0.27,
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
          'all-time',
          'Highest',
          0.36,
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
