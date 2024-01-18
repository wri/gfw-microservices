import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { AlertsRepository } from './alerts.repository';

@Injectable()
export class AlertsService {
  constructor(private readonly dashboardRepository: AlertsRepository) {}

  async getDashboardData(
    listId: number,
    locationId: string,
    clientDatabase: string,
    pageNumber = 1,
    pageSize = 10
  ) {
    const locationIdArray = this.transformLocationId(locationId);

    const whereClause =
      locationIdArray.length > 0
        ? { listId: listId, locationId: In(locationIdArray) }
        : { listId: listId };

    const [result, total] = await this.dashboardRepository.findAndCount(clientDatabase, {
      where: whereClause,
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    });

    return {
      data: result,
      count: total,
    };
  }

  transformLocationId(locationId = ''): Array<number> {
    let locationIdArray = [];
    locationIdArray = locationId.split(',');
    locationIdArray = locationIdArray.reduce((acc, item) => {
      const value = parseInt(item, 10);
      if (!isNaN(value)) {
        acc.push(value);
      }
      return acc;
    }, []);
    return locationIdArray;
  }
}
