import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getDashboardData(
    listId: number,
    locationIdArray: Array<number>,
    clientDatabase: string,
    pageNumber = 1,
    pageSize = 10
  ) {
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
}
