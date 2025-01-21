import {
  Logger,
  Controller,
  Post,
  Body,
  Scope,
  UsePipes,
  BadRequestException,
  PipeTransform,
  Injectable,
} from '@nestjs/common';
import { BasicFieldsFileRequest } from '@wri-monorepos/sql';
import { PipeService } from '../pipe/pipe.service';
import { z } from 'zod';
import { getSchemaByType } from './message.schema';

export const BooleanStringZod = z.preprocess((val) => val === 'true', z.boolean()).default(false);

// Function to get the appropriate schema based on the type

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  transform(value: BasicFieldsFileRequest) {
    const schema = getSchemaByType(value.type);
    try {
      const parsed = schema.parse(value);
      return parsed;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        throw new BadRequestException({
          message: 'Validation failed',
          errors: formattedErrors,
        });
      }
      throw new BadRequestException('Invalid input');
    }
  }
}

@Controller({
  path: 'list',
  scope: Scope.REQUEST,
})
export class ListMessageController {
  private readonly logger = new Logger(ListMessageController.name);

  constructor(private readonly pipeService: PipeService) {}

  @Post('download')
  @UsePipes(ZodValidationPipe)
  async download(@Body() body: BasicFieldsFileRequest) {
    this.logger.log('List message received', body);
    this.pipeService.makeFile(body);
    return body;
  }
}
