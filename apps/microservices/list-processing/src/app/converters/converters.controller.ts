import { Controller, Post, Param, Body } from '@nestjs/common';
import { ConvertersService } from './converters.service';
import { InternalServerErrorException } from '@nestjs/common';

@Controller('converters')
export class ConvertersController {
  constructor(private readonly convertersService: ConvertersService) {}

  @Post('/:id/start')
  async startConverter(
    @Param('id') id: number,
    @Body('organizationId') organizationId?: number
  ): Promise<string> {
    try {
      await this.convertersService.runConverter(id, organizationId);
    } catch (err) {
      console.error(`Error processing Converter Job with ID: ${id}:`, err);

      throw new InternalServerErrorException(
        'Converter process failed for one or more organizations.'
      );
    }

    return 'Converter process completed successfully.';
  }
}
