"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let DatabaseService = class DatabaseService {
    createTypeOrmOptions() {
        return {
            type: 'mssql',
            host: this.config.get('MSSQL_HOSTNAME'),
            port: parseInt(this.config.get('MSSQL_PORT'), 10),
            database: this.config.get('MSSQL_DATABASE'),
            username: this.config.get('MSSQL_USERNAME'),
            password: this.config.get('MSSQL_PASSWORD'),
            synchronize: false,
            extra: {
                trustServerCertificate: true,
            },
        };
    }
};
tslib_1.__decorate([
    (0, common_1.Inject)(config_1.ConfigService),
    tslib_1.__metadata("design:type", config_1.ConfigService)
], DatabaseService.prototype, "config", void 0);
DatabaseService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], DatabaseService);
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=database.service.js.map