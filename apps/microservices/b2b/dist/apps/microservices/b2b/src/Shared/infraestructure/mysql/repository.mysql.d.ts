import { StoredProcedureCommandFactory } from './store-procedure.comand.factory';
export declare abstract class RepositoryMysql {
    private readonly connection;
    protected readonly storeProcedureFactory: StoredProcedureCommandFactory;
    constructor();
}
