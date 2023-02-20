import { Logger, Injectable } from '@nestjs/common';

@Injectable()
export class ShapefileService {
  private readonly logger = new Logger(ShapefileService.name);

}
