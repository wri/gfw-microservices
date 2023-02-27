import { CreateConnectionDto } from 'src/Connection/application/dtos/connection.dto';
import { ConnectionUseCases } from 'src/Connection/application/connection.use-case';
export declare class ConnectionController {
    private connectionUseCases;
    constructor(connectionUseCases: ConnectionUseCases);
    acceptConnection(id: any): Promise<void>;
    createConnection(connectionDto: CreateConnectionDto): Promise<void>;
    deleteConnection(connectionId: string): Promise<void>;
}
