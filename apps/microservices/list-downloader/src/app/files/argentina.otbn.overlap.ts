import { Injectable } from "@nestjs/common";
import { IPipeService } from "../pipe/IPipeService";
import { GenerationFileRequest } from "@wri-monorepos/sql";


@Injectable()
export class ArgentinaOtbnOverlap extends IPipeService {

  start(filters: GenerationFileRequest, table?: string, fileSuffix?: string) {
    throw new Error("Method not implemented.");
  }

  process(data: any, filters: GenerationFileRequest) {
    throw new Error("Method not implemented.");
  }

  finish(filters: GenerationFileRequest) {
    throw new Error("Method not implemented.");
  }

}
