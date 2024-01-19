import { Injectable } from '@nestjs/common';
import { DashboardDataType } from '@wri-monorepos/sql';
import { AlertsRepository } from './alerts.repository';

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
    const listDashboardData = await this.alertsRepository.findGFWListDashboardData(listID);
    return this.buildGeojson(listDashboardData ?? []);
  }

  async getDashboardData(listID: number, clientDatabase: string) {
    const listDashboardData = await this.alertsRepository.findDashboardData(listID, clientDatabase);
    return this.buildGeojson(listDashboardData ?? []);
  }

  buildGeojson(listDashboardData: DashboardDataType[]) {
    const modDashData = listDashboardData
      .filter((l) => l.gadmid)
      .map((l) => {
        return {
          geometry: {},
          type: 'Feature',
          properties: {
            ...l,
            fire: this.formatDates(l.viirs_alerts_daily),
            fireAlerts: true, //this seems to denote coverage of fire alerts and it should always be true.
            gladAlerts: l.gladAlerts.trim().toLowerCase() === 'true',
            glad_alerts_daily: this.formatDates(l.glad_alerts_daily),
            glad_alerts_weekly: this.formatDates(l.glad_alerts_weekly),
            glad_alerts_monthly: this.formatDates(l.glad_alerts_monthly),
            viirs_alerts_daily: this.formatDates(l.viirs_alerts_daily),
            umd: l.tree_cover_extent_total || 0,
          },
        };
      });
    const diss = modDashData.filter((l) => l.properties.location_id === -1);
    const geo = modDashData.filter((l) => l.properties.location_id !== -1);
    return {
      failedGeoJSON: { features: [] },
      dissolvedGeoJSON: { features: diss },
      geojson: { features: geo },
    };
  }

  formatDates(dateString: string) {
    if (dateString === '{}') return [];
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
