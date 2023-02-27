import { SQLUtils } from '../../../../../../../libs/sql/src';
import { StoredProcedureCommand } from './store-procedure.comand';
import { ParamStoreProcedure } from './store-procedure.params';
export declare class StoredProcedureCommandFactory {
    private readonly connection;
    constructor(connection: SQLUtils);
    create(name: string, parameters: ParamStoreProcedure[]): StoredProcedureCommand;
}
