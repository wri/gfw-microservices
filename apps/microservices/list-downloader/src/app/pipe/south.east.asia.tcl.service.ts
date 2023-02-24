import { Injectable } from "@nestjs/common";
import { GenerationFileRequest } from "@wri-monorepos/sql";
import { IPipeService } from "./IPipeService";

@Injectable()
export class SouthEastAsiaTCLService extends IPipeService {
  start(filters: GenerationFileRequest) {
    throw new Error("Method not implemented.");
  }
  process(data: any) {
    throw new Error("Method not implemented.");
  }
  finish(filters: GenerationFileRequest) {
    throw new Error("Method not implemented.");
  }

}
