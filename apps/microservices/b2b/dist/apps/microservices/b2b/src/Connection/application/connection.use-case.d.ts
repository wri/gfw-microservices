import { DataServices } from 'src/Shared/domain/data-service';
import { CreateConnectionDto } from 'src/Connection/application/dtos/connection.dto';
export declare class ConnectionUseCases {
    private dataServices;
    constructor(dataServices: DataServices);
    createConnection(connectionDto: CreateConnectionDto): Promise<void>;
    acceptConnection(id: any): Promise<void>;
    deleteConnection(id: any): Promise<void>;
}
