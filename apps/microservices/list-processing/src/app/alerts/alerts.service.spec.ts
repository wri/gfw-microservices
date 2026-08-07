import { AlertsService } from './alerts.service';
import { AlertsRepository } from './alerts.repository';

describe('AlertsService - formatData', () => {
  it('should format data correctly with string gladAlerts', () => {
    const alertsService = new AlertsService({} as AlertsRepository);
    const input = [
      {
        list_id: 1,
        location_id: 1,
        gadm_id: 'IDN.12.7',
        gadmid: 'IDN.12.7',
        gladAlerts: 'true',
        glad_alerts_daily: '{"2020-01-05":21}',
        glad_alerts_weekly: '{"2020-01":21}',
        glad_alerts_monthly: '{"2020-01":21}',
        viirs_alerts_daily: '{"2020-01-05":2}',
        tree_cover_extent_total: 100,
        Country: 'Indonesia',
        State: 'Test State',
        'Sub State': 'Test Sub State',
        total_ha: 100,
        glad_alerts_coverage: '',
        integrated_alerts_coverage: '',
        integratedAlertsAreaAllNominal: '',
        integratedAlertsAreaAllHigh: '',
        integratedAlertsAreaAllHighest: '',
        integratedAlertsAreaSbtnNaturalForestsNominal: '',
        integratedAlertsAreaSbtnNaturalForestsHigh: '',
        integratedAlertsAreaSbtnNaturalForestsHighest: '',
        integratedAlertsAreaSbtnNaturalEcosystemNominal: '',
        integratedAlertsAreaSbtnNaturalEcosystemHigh: '',
        integratedAlertsAreaSbtnNaturalEcosystemHighest: '',
        integratedAlertsAreaJrcNominal: '',
        integratedAlertsAreaJrcHigh: '',
        integratedAlertsAreaJrcHighest: '',
        status_code: 0,
      },
    ];

    const result = alertsService.formatData(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({
        list_id: 1,
        location_id: 1,
        gadm_id: 'IDN.12.7',
        gadmid: 'IDN.12.7',
        gladAlerts: true,
        glad_alerts_daily: [{ day: '2020-01-05', count: 21 }],
        glad_alerts_weekly: [{ day: '2020-01', count: 21 }],
        glad_alerts_monthly: [{ day: '2020-01', count: 21 }],
        viirs_alerts_daily: [{ day: '2020-01-05', count: 2 }],
        tree_cover_extent_total: 100,
        Country: 'Indonesia',
        State: 'Test State',
        'Sub State': 'Test Sub State',
        total_ha: 100,
        glad_alerts_coverage: '',
        integrated_alerts_coverage: '',
        integratedAlertsAreaAllNominal: '',
        integratedAlertsAreaAllHigh: '',
        integratedAlertsAreaAllHighest: '',
        integratedAlertsAreaSbtnNaturalForestsNominal: '',
        integratedAlertsAreaSbtnNaturalForestsHigh: '',
        integratedAlertsAreaSbtnNaturalForestsHighest: '',
        integratedAlertsAreaSbtnNaturalEcosystemNominal: '',
        integratedAlertsAreaSbtnNaturalEcosystemHigh: '',
        integratedAlertsAreaSbtnNaturalEcosystemHighest: '',
        integratedAlertsAreaJrcNominal: '',
        integratedAlertsAreaJrcHigh: '',
        integratedAlertsAreaJrcHighest: '',
        status_code: 0,
        fire: [{ day: '2020-01-05', count: 2 }],
        fireAlerts: true,
        umd: 100,
      })
    );
  });

  it('should format data correctly with boolean gladAlerts', () => {
    const alertsService = new AlertsService({} as AlertsRepository);
    const input = [
      {
        list_id: 1,
        location_id: 1,
        gadm_id: 'IDN.12.7',
        gadmid: 'IDN.12.7',
        gladAlerts: true,
        glad_alerts_daily: '{"2020-01-05":21}',
        glad_alerts_weekly: '{"2020-01":21}',
        glad_alerts_monthly: '{"2020-01":21}',
        viirs_alerts_daily: '{"2020-01-05":2}',
        tree_cover_extent_total: 100,
        Country: 'Indonesia',
        State: 'Test State',
        'Sub State': 'Test Sub State',
        total_ha: 100,
        glad_alerts_coverage: '',
        integrated_alerts_coverage: '',
        integratedAlertsAreaAllNominal: '',
        integratedAlertsAreaAllHigh: '',
        integratedAlertsAreaAllHighest: '',
        integratedAlertsAreaSbtnNaturalForestsNominal: '',
        integratedAlertsAreaSbtnNaturalForestsHigh: '',
        integratedAlertsAreaSbtnNaturalForestsHighest: '',
        integratedAlertsAreaSbtnNaturalEcosystemNominal: '',
        integratedAlertsAreaSbtnNaturalEcosystemHigh: '',
        integratedAlertsAreaSbtnNaturalEcosystemHighest: '',
        integratedAlertsAreaJrcNominal: '',
        integratedAlertsAreaJrcHigh: '',
        integratedAlertsAreaJrcHighest: '',
        status_code: 0,
      },
    ];

    const result = alertsService.formatData(input);

    expect(result).toHaveLength(1);
    expect(result[0].gladAlerts).toBe(true);
  });

  it('should filter out items without gadmid', () => {
    const alertsService = new AlertsService({} as AlertsRepository);
    const input = [
      {
        list_id: 1,
        location_id: 1,
        gadm_id: 'IDN.12.7',
        gadmid: null, // This will be filtered out
        gladAlerts: true,
        glad_alerts_daily: '{"2020-01-05":21}',
        glad_alerts_weekly: '{"2020-01":21}',
        glad_alerts_monthly: '{"2020-01":21}',
        viirs_alerts_daily: '{"2020-01-05":2}',
        tree_cover_extent_total: 100,
        Country: 'Indonesia',
        State: 'Test State',
        'Sub State': 'Test Sub State',
        name_all: 'Test Name',
        gadmid_0: 'IDN',
        gadmid_0_lat: 0,
        gadmid_0_lon: 0,
        gadmid_1: 'IDN.12',
        gadmid_1_lat: 0,
        gadmid_1_lon: 0,
        gadmid_2: 'IDN.12.7',
        gadmid_2_lat: 0,
        gadmid_2_lon: 0,
        location_lat: 0,
        location_lon: 0,
        location_name: 'Test Location',
        totalHa: 100,
      },
    ] as any;

    const result = alertsService.formatData(input);

    expect(result).toHaveLength(0);
  });
});

describe('AlertsService - formatDates', () => {
  it('should handle empty object string', () => {
    const alertsService = new AlertsService({} as AlertsRepository);
    const result = alertsService.formatDates('{}');
    expect(result).toEqual([]);
  });

  it('should handle single date entry', () => {
    const alertsService = new AlertsService({} as AlertsRepository);
    const result = alertsService.formatDates('{"2020-01-05":21}');
    expect(result).toEqual([{ day: '2020-01-05', count: 21 }]);
  });

  it('should handle multiple date entries', () => {
    const alertsService = new AlertsService({} as AlertsRepository);
    const result = alertsService.formatDates('{"2020-01-05":21,"2020-01-06":22}');
    expect(result).toEqual([
      { day: '2020-01-05', count: 21 },
      { day: '2020-01-06', count: 22 },
    ]);
  });
});

describe('AlertsService - getDashboardDataPaginated', () => {
  it('should handle null data from repository', async () => {
    const mockRepository: Partial<AlertsRepository> = {
      findDashboardDataByListIdPaginated: jest.fn().mockResolvedValue(null),
    };
    const alertsService = new AlertsService(mockRepository as AlertsRepository);

    const result = await alertsService.getDashboardDataPaginated(1, 'test-db', 1, 10);

    expect(result).toEqual([]);
  });
});

describe('AlertsService - getGFWDashboardDataPaginated', () => {
  it('should handle null data from repository', async () => {
    const mockRepository: Partial<AlertsRepository> = {
      findGFWDashboardDataByListIdPaginated: jest.fn().mockResolvedValue(null),
    };
    const alertsService = new AlertsService(mockRepository as AlertsRepository);

    const result = await alertsService.getGFWDashboardDataPaginated(1, 1, 10);

    expect(result).toEqual([]);
  });
});
