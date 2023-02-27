"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqlModule = void 0;
const tslib_1 = require("tslib");
const uspGetListLocations_1 = require("./lists/uspGetListLocations");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const database_service_1 = require("./util/database.service");
const llp_1 = require("./llp");
let SqlModule = class SqlModule {
};
SqlModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forRootAsync({ useClass: database_service_1.DatabaseService })],
        controllers: [],
        providers: [
            llp_1.UspGetAnalysisDataCountForUserList,
            llp_1.UspGetPaginatedAnalysisDataForUserList,
            llp_1.UspGetListNameSchema,
            uspGetListLocations_1.UspGetListLocations,
        ],
        exports: [
            llp_1.UspGetAnalysisDataCountForUserList,
            llp_1.UspGetPaginatedAnalysisDataForUserList,
            llp_1.UspGetListNameSchema,
            uspGetListLocations_1.UspGetListLocations,
        ],
    })
], SqlModule);
exports.SqlModule = SqlModule;
//# sourceMappingURL=sql.module.js.map