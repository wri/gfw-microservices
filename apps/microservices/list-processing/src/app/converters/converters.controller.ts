import { Controller, Post, Param, Query } from '@nestjs/common';
import { ConvertersService } from './converters.service';
import { InternalServerErrorException } from '@nestjs/common';

@Controller('converters')
export class ConvertersController {
  constructor(private readonly convertersService: ConvertersService) {}

  @Post('/converters/:id/start')
  async startConverter(
    @Param('id') id: number,
    @Query('organizationId') organizationId?: number
  ): Promise<string> {
    const clientStoreNames = await this.convertersService.getClientStoreNames(organizationId);

    try {
      await this.convertersService.runConverter(id, clientStoreNames);
    } catch (err) {
      console.error(`Error processing ${clientStoreNames}:`, err);

      throw new InternalServerErrorException(
        'Converter process failed for one or more organizations.'
      );
    }

    return 'Converter process completed successfully.';
  }
}
