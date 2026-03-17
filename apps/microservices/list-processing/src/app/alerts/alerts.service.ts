import { Injectable } from '@nestjs/common';
import { DashboardDataType } from '@wri-monorepos/sql';
import { AlertsRepository } from './alerts.repository';

const ALERT_PIXEL_SIZE_HA = 0.09;

interface GlobalIntegratedDisturbanceDailyRow {
  day: string;
  totalAlertCount: number;
  totalAlertHectares: number;
  sbtnNaturalForestCount: number;
  sbtnNaturalForestHectares: number;
  sbtnNaturalOpenEcosystemsCount: number;
  sbtnNaturalOpenEcosystemsHectares: number;
  jrcForestCount: number;
  jrcForestHectares: number;
}

interface GlobalIntegratedDisturbanceDaily {
  nominal: GlobalIntegratedDisturbanceDailyRow[];
  high: GlobalIntegratedDisturbanceDailyRow[];
  highest: GlobalIntegratedDisturbanceDailyRow[];
}

@Injectable()
export class AlertsService {
  constructor(private readonly alertsRepository: AlertsRepository) {}

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

        const globalIntegratedDisturbanceDaily = this.buildGlobalIntegratedDisturbanceDaily(l);

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

  private buildGlobalIntegratedDisturbanceDaily(
    data: DashboardDataType
  ): GlobalIntegratedDisturbanceDaily {
    return {
      nominal: this.buildConfidenceLevelRows(
        data.integratedAlertsDailyAllNominal,
        data.integratedAlertsDailySbtnNominal,
        data.integratedAlertsDailyJrcNominal
      ),
      high: this.buildConfidenceLevelRows(
        data.integratedAlertsDailyAllHigh,
        data.integratedAlertsDailySbtnHigh,
        data.integratedAlertsDailyJrcHigh
      ),
      highest: this.buildConfidenceLevelRows(
        data.integratedAlertsDailyAllHighest,
        data.integratedAlertsDailySbtnHighest,
        data.integratedAlertsDailyJrcHighest
      ),
    };
  }

  private buildConfidenceLevelRows(
    allCounts: string | undefined,
    sbtnCounts: string | undefined,
    jrcCounts: string | undefined
  ): GlobalIntegratedDisturbanceDailyRow[] {
    const all = this.parseAlertsCounts(allCounts);
    const sbtn = this.parseAlertsCounts(sbtnCounts);
    const jrc = this.parseAlertsCounts(jrcCounts);

    const dates = new Set<string>([...Object.keys(all), ...Object.keys(sbtn), ...Object.keys(jrc)]);

    return Array.from(dates)
      .sort()
      .map((day) => {
        const totalAlertCount = all[day] ?? 0;
        const sbtnNaturalForestCount = sbtn[day] ?? 0;
        const jrcForestCount = jrc[day] ?? 0;
        const sbtnNaturalOpenEcosystemsCount = 0;

        return {
          day,
          totalAlertCount,
          totalAlertHectares: this.toHectares(totalAlertCount),
          sbtnNaturalForestCount,
          sbtnNaturalForestHectares: this.toHectares(sbtnNaturalForestCount),
          sbtnNaturalOpenEcosystemsCount,
          sbtnNaturalOpenEcosystemsHectares: this.toHectares(sbtnNaturalOpenEcosystemsCount),
          jrcForestCount,
          jrcForestHectares: this.toHectares(jrcForestCount),
        };
      });
  }

  private parseAlertsCounts(alerts: string | undefined): Record<string, number> {
    if (!alerts || alerts === '{}') {
      return {};
    }

    if (typeof alerts !== 'string') {
      return {};
    }

    try {
      const parsed = JSON.parse(alerts);
      if (parsed && typeof parsed === 'object') {
        return Object.entries(parsed).reduce<Record<string, number>>((acc, [day, value]) => {
          const numericValue = typeof value === 'number' ? value : Number(value);
          acc[day] = Number.isFinite(numericValue) ? numericValue : 0;
          return acc;
        }, {});
      }
    } catch (error) {
      return {};
    }

    return {};
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
