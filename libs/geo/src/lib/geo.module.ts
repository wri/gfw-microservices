import { Module } from '@nestjs/common';
import { GeoService } from './geo.service';

@Module({
  controllers: [],
  providers: [GeoService],
  exports: [GeoService],
})
export class GeoModule {}
