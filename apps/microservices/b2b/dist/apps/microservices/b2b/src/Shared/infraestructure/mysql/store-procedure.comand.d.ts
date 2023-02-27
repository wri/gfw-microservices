import { SQLUtils } from '../../../../../../../libs/sql/src';
import { Command } from '../../domain/command';
import { ParamStoreProcedure } from './store-procedure.params';
export declare class StoredProcedureCommand implements Command {
    private readonly connection;
    private readonly procedureName;
    private readonly parameters;
    constructor(connection: SQLUtils, procedureName: string, parameters: ParamStoreProcedure[]);
    execute(): Promise<any>;
}
