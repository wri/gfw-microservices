import { Logger, Injectable } from '@nestjs/common';

@Injectable()
export class ResultService {
  private readonly logger = new Logger(ResultService.name);

}
