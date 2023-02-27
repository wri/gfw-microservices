"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoredProcedureCommand = void 0;
class StoredProcedureCommand {
    constructor(connection, procedureName, parameters) {
        this.connection = connection;
        this.procedureName = procedureName;
        this.parameters = parameters;
    }
    async execute() {
        const result = this.connection.executeQuery(this.procedureName, this.parameters);
        return result;
    }
}
exports.StoredProcedureCommand = StoredProcedureCommand;
//# sourceMappingURL=store-procedure.comand.js.map