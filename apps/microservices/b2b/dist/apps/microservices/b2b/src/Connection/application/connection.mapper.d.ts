import { CreateConnectionDto } from 'src/Connection/application/dtos/connection.dto';
import { Connection } from 'src/Connection/domain/connection';
import { ParamStoreProcedure } from 'src/Shared/infraestructure/mysql/store-procedure.params';
export declare class ConnectionDataMapper {
    static createConnectionDtotoConnection(connectionDto: CreateConnectionDto): Connection;
    static toProcedureParam(connection: Connection): ParamStoreProcedure[];
    static toIdParam(id: string): ParamStoreProcedure[];
}
