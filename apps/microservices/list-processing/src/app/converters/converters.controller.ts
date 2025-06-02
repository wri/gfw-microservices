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
    // Step 1: Update converter start_time
    await this.convertersService.updateConverterStartTime(id);

    // Step 2: Get relevant client stores
    const clientStore = await this.convertersService.getClientStoresByOrgId(organizationId);

    // Step 3: process
    try {
      await this.convertersService.runConverterForClientStores(id, clientStore);
    } catch (err) {
      // Optionally log the error and decide if we'd like to stop or skip
      console.error(`Error processing ${clientStore}:`, err);
      throw new InternalServerErrorException(
        'Converter process failed for one or more organizations.'
      );
    }

    // Step 4: If no errors, update status
    await this.convertersService.updateConverterStatus(id, 'OK');

    return 'Converter process completed successfully.';
  }
}
