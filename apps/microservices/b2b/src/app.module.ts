import { Module } from '@nestjs/common';
import { AppController } from './Shared/infraestructure/app.controller';
import { AppService } from './Shared/application/app.service';
import { DataServicesModule } from './Shared/application/data-service/data-service.module';
import { ConnectionController } from './Connection/infrastructure/connection.controller';
import { InvitationController } from './Invitation/infrastructure/invitation.controller';
import { InvitationUseCasesModule } from './Invitation/application/invitation.module';
import { ConnectionUseCasesModule } from './Connection/application/connection.module';

@Module({
  imports: [
    DataServicesModule,
    InvitationUseCasesModule,
    ConnectionUseCasesModule,
  ],
  controllers: [AppController, ConnectionController, InvitationController],
  providers: [AppService],
})
export class AppModule {}
