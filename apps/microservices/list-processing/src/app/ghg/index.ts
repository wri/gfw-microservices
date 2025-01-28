import { Module } from '@nestjs/common'
import { GHGController } from './ghg.controller'
import { GHGService } from './ghg.service'

@Module({
    imports: [],
    controllers: [GHGController],
    providers: [GHGService],
  })
  export class GHGModule {}