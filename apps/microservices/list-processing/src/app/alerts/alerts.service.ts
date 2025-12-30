import { Injectable } from '@nestjs/common';
import { DashboardDataType } from '@wri-monorepos/sql';
import { AlertsRepository } from './alerts.repository';

const ALERT_PIXEL_SIZE_HA = 0.09;

@Injectable()
export class AlertsService {
  constructor(private readonly alertsRepository: AlertsRepository) {}

  async getGFWListDashboardTimestamp(listID: number) {
    return await this.alertsRepository.findGFWListDashboardTimestampByListId(listID);
  }

  async getDashboardTimestamp(listID: number, clientDatabase: string) {
    return await this.alertsRepository.findDashboardTimestampByListId(listID, clientDatabase);
  }

  async getGFWListDashboardData(listID: number) {
    const listDashboardData = await this.alertsRepository.findGFWListDashboardDataByListId(listID);
    return this.buildGeojson(listDashboardData ?? []);
  }

  async getDashboardData(listID: number, clientDatabase: string) {
    const listDashboardData = await this.alertsRepository.findDashboardDataByListId(
      listID,
      clientDatabase
    );
    return this.buildGeojson(listDashboardData ?? []);
  }

  async countDashboardData(listID: number, clientDatabase: string) {
    return await this.alertsRepository.countDashboardData(listID, clientDatabase);
  }

  async getDashboardDataPaginated(
    listID: number,
    clientDatabase: string,
    pageNumber: number,
    rowsPerPage: number
  ) {
    const makePageStartOnZero = pageNumber - 1;
    const listDashboardData = await this.alertsRepository.findDashboardDataByListIdPaginated(
      listID,
      clientDatabase,
      makePageStartOnZero,
      rowsPerPage
    );
    return this.formatData(listDashboardData ?? []);
  }

  async countGFWDashboardData(listID: number) {
    return await this.alertsRepository.countGFWDashboardData(listID);
  }

  async getGFWDashboardDataPaginated(listID: number, pageNumber: number, rowsPerPage: number) {
    const makePageStartOnZero = pageNumber - 1;
    const listDashboardData = await this.alertsRepository.findGFWDashboardDataByListIdPaginated(
      listID,
      makePageStartOnZero,
      rowsPerPage
    );
    return this.formatData(listDashboardData ?? []);
  }

  formatData(listDashboardData: DashboardDataType[]) {
    return listDashboardData
      .filter((l) => l.gadmid)
      .map((l) => {
        const gladAlerts =
          typeof l.gladAlerts === 'string'
            ? l.gladAlerts.trim().toLowerCase() === 'true'
            : l.gladAlerts;

        // SQL now returns pre-aggregated numeric values, no JSON parsing needed
        // Only create rows if there are actual values (not zero or undefined)
        const hasNominalData =
          (l.integratedAlertsDailyAllNominal || 0) > 0 ||
          (l.integratedAlertsDailySbtnNominal || 0) > 0 ||
          (l.integratedAlertsDailyJrcNominal || 0) > 0;

        const hasHighData =
          (l.integratedAlertsDailyAllHigh || 0) > 0 ||
          (l.integratedAlertsDailySbtnHigh || 0) > 0 ||
          (l.integratedAlertsDailyJrcHigh || 0) > 0;

        const hasHighestData =
          (l.integratedAlertsDailyAllHighest || 0) > 0 ||
          (l.integratedAlertsDailySbtnHighest || 0) > 0 ||
          (l.integratedAlertsDailyJrcHighest || 0) > 0;

        const globalIntegratedDisturbanceDaily = {
          nominal: hasNominalData
            ? [
                {
                  day: 'all-time',
                  totalAlertCount: l.integratedAlertsDailyAllNominal || 0,
                  totalAlertHectares: this.toHectares(l.integratedAlertsDailyAllNominal || 0),
                  sbtnNaturalForestCount: l.integratedAlertsDailySbtnNominal || 0,
                  sbtnNaturalForestHectares: this.toHectares(
                    l.integratedAlertsDailySbtnNominal || 0
                  ),
                  sbtnNaturalOpenEcosystemsCount: 0,
                  sbtnNaturalOpenEcosystemsHectares: 0,
                  jrcForestCount: l.integratedAlertsDailyJrcNominal || 0,
                  jrcForestHectares: this.toHectares(l.integratedAlertsDailyJrcNominal || 0),
                },
              ]
            : [],
          high: hasHighData
            ? [
                {
                  day: 'all-time',
                  totalAlertCount: l.integratedAlertsDailyAllHigh || 0,
                  totalAlertHectares: this.toHectares(l.integratedAlertsDailyAllHigh || 0),
                  sbtnNaturalForestCount: l.integratedAlertsDailySbtnHigh || 0,
                  sbtnNaturalForestHectares: this.toHectares(l.integratedAlertsDailySbtnHigh || 0),
                  sbtnNaturalOpenEcosystemsCount: 0,
                  sbtnNaturalOpenEcosystemsHectares: 0,
                  jrcForestCount: l.integratedAlertsDailyJrcHigh || 0,
                  jrcForestHectares: this.toHectares(l.integratedAlertsDailyJrcHigh || 0),
                },
              ]
            : [],
          highest: hasHighestData
            ? [
                {
                  day: 'all-time',
                  totalAlertCount: l.integratedAlertsDailyAllHighest || 0,
                  totalAlertHectares: this.toHectares(l.integratedAlertsDailyAllHighest || 0),
                  sbtnNaturalForestCount: l.integratedAlertsDailySbtnHighest || 0,
                  sbtnNaturalForestHectares: this.toHectares(
                    l.integratedAlertsDailySbtnHighest || 0
                  ),
                  sbtnNaturalOpenEcosystemsCount: 0,
                  sbtnNaturalOpenEcosystemsHectares: 0,
                  jrcForestCount: l.integratedAlertsDailyJrcHighest || 0,
                  jrcForestHectares: this.toHectares(l.integratedAlertsDailyJrcHighest || 0),
                },
              ]
            : [],
        };

        return {
          ...l,
          fire: this.formatDates(l.viirs_alerts_daily as string),
          fireAlerts: true, //this seems to denote coverage of fire alerts and it should always be true.
          gladAlerts,
          glad_alerts_daily: this.formatDates(l.glad_alerts_daily as string),
          glad_alerts_weekly: this.formatDates(l.glad_alerts_weekly as string),
          glad_alerts_monthly: this.formatDates(l.glad_alerts_monthly as string),
          viirs_alerts_daily: this.formatDates(l.viirs_alerts_daily as string),
          umd: l.tree_cover_extent_total || 0,
          globalIntegratedDisturbanceDaily,
        };
      });
  }

  buildGeojson(listDashboardData: DashboardDataType[] = []) {
    const modDashData = this.formatData(listDashboardData);

    const geoData = modDashData.map((l) => {
      return {
        geometry: {},
        type: 'Feature',
        properties: {
          ...l,
        },
      };
    });

    const diss = geoData.filter((l) => l.properties.location_id === -1);
    const geo = geoData.filter((l) => l.properties.location_id !== -1);
    return {
      failedGeoJSON: { features: [] },
      dissolvedGeoJSON: { features: diss },
      geojson: { features: geo },
    };
  }

  private toHectares(count: number): number {
    return Number((count * ALERT_PIXEL_SIZE_HA).toFixed(2));
  }

  formatDates(dateString: string) {
    if (dateString === '{}') {
      return [];
    }
    const dayStr = dateString.replace(/{|}/gim, '');
    const dayStrArray = dayStr.split(',');
    return dayStrArray.map((s) => {
      const dayCountSplit = s.split(':');
      return {
        day: JSON.parse(dayCountSplit[0]),
        count: Number(dayCountSplit[1]),
      };
    });
  }
}
