"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryMysql = void 0;
const src_1 = require("../../../../../../../libs/sql/src");
const config_1 = require("./config");
const store_procedure_comand_factory_1 = require("./store-procedure.comand.factory");
class RepositoryMysql {
    constructor() {
        this.connection = new src_1.SQLUtils(config_1.SqlConfig);
        this.storeProcedureFactory = new store_procedure_comand_factory_1.StoredProcedureCommandFactory(this.connection);
    }
}
exports.RepositoryMysql = RepositoryMysql;
//# sourceMappingURL=repository.mysql.js.map