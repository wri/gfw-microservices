import { Controller, Post, Param, Body, Logger } from '@nestjs/common';
import { ConvertersService } from './converters.service';
import { InternalServerErrorException } from '@nestjs/common';

@Controller('converters')
export class ConvertersController {
  private readonly logger = new Logger(ConvertersController.name);

  constructor(private readonly convertersService: ConvertersService) {}

  @Post('/:id/start')
  async startConverter(
    @Param('id') id: number,
    @Body('organizationId') organizationId?: number
  ): Promise<string> {
    try {
      await this.convertersService.runConverter(id, organizationId);
    } catch (err) {
      this.logger.error(`Error processing Converter Job with ID: ${id}`, err.stack || err);
      
      throw new InternalServerErrorException(
        'Converter process failed for one or more organizations.'
      );
    }

    return 'Converter process completed successfully.';
  }
}
