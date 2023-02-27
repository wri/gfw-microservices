"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoredProcedureCommandFactory = void 0;
const store_procedure_comand_1 = require("./store-procedure.comand");
class StoredProcedureCommandFactory {
    constructor(connection) {
        this.connection = connection;
    }
    create(name, parameters) {
        return new store_procedure_comand_1.StoredProcedureCommand(this.connection, name, parameters);
    }
}
exports.StoredProcedureCommandFactory = StoredProcedureCommandFactory;
//# sourceMappingURL=store-procedure.comand.factory.js.map