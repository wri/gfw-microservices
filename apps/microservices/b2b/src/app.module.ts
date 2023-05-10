import { Module } from '@nestjs/common';
import { AppController } from './Shared/infraestructure/app.controller';
import { AppService } from './Shared/application/app.service';
import { DataServicesModule } from './Shared/application/data-service/data-service.module';
import { ConnectionController } from './Connection/infrastructure/connection.controller';
import { InvitationController } from './Invitation/infrastructure/invitation.controller';
import { InvitationUseCasesModule } from './Invitation/invitation.module';
import { ConnectionUseCasesModule } from './Connection/connection.module';
import { LogsModule } from './Logs/log.module';
import { UserModule } from './User/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from './Shared/infraestructure/typeorm/entities';

@Module({
  imports: [
    UserModule,
    InvitationUseCasesModule,
    ConnectionUseCasesModule,
    LogsModule,
    TypeOrmModule.forRoot({
      type: 'mysql', 
      host: '52.45.199.190',
      port: 65300,
      username: 'GFWProUser',
      password: 'measure2010!',
      database: 'gfwpro',
      entities,
      synchronize: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'mydb.sqlite',
      entities,
      synchronize: true,
    }),
  ],
  controllers: [AppController, ConnectionController, InvitationController],
  providers: [AppService],
})
export class AppModule {}
