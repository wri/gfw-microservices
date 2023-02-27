import * as mssql from 'mssql';
export declare const get: (name: any, config: any) => Promise<mssql.ConnectionPool>;
export declare const closeAll: () => Promise<any[]>;
