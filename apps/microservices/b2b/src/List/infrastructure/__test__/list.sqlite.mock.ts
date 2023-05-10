import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import Result from "../../../Shared/domain/result";
import ResultPromise from "../../../Shared/domain/result/result.promise";
import { ListRepository } from "../../application/connection.repository";
import { SharedListEntity } from "../list-shared.entity";

@Injectable()
export class ListRepositorySQLlite implements ListRepository {
  constructor(
    @InjectRepository(ListRepository)
    private readonly listTypeRepository: Repository<SharedListEntity>,
  ) {}

  async create(list: SharedListEntity): ResultPromise<SharedListEntity> {
    const res = await this.listTypeRepository.save(list);
    return Result.ok(res);
  }

  async update(
    id: number,
    list: SharedListEntity,
  ): ResultPromise<SharedListEntity> {
    const res = await this.listTypeRepository.save({ id, ...list });
    return Result.ok(res);
  }

  async delete(id: number): ResultPromise<void> {
    const res = await this.listTypeRepository.delete(id);
    return Result.ok();
  }
}