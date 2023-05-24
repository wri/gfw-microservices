import { Module } from '@nestjs/common';
import { AppController } from './Shared/infraestructure/app.controller';
import { AppService } from './Shared/application/app.service';
import { ConnectionController } from './Connection/infrastructure/connection.controller';
import { InvitationController } from './Invitation/infrastructure/invitation.controller';
import { InvitationUseCasesModule } from './Invitation/invitation.module';
import { ConnectionUseCasesModule } from './Connection/connection.module';

@Module({
  imports: [InvitationUseCasesModule, ConnectionUseCasesModule],
  controllers: [AppController, ConnectionController, InvitationController],
  providers: [AppService],
})
export class AppModule {}
