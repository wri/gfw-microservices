import * as sql from 'mssql';
export declare class SQLUtils {
    config: sql.config;
    connection: sql.ConnectionPool;
    constructor(config: sql.config);
    connect(): Promise<void>;
    query<T>(query: string, parameters?: any[]): Promise<T>;
    executeQuery<T>(query: string, parameters?: any[]): Promise<T>;
    executeQueryArray<T>(query: string, parameters?: any[]): Promise<Array<T>>;
    disconnect(): Promise<void>;
}
