"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeAll = exports.get = void 0;
const mssql = require("mssql");
const pools = new Map();
const get = (name, config) => {
    if (!pools.has(name)) {
        if (!config) {
            throw new Error('Pool does not exist');
        }
        const pool = new mssql.ConnectionPool(config);
        const close = pool.close.bind(pool);
        pool.close = (...args) => {
            pools.delete(name);
            return close(...args);
        };
        pools.set(name, pool.connect());
    }
    return pools.get(name);
};
exports.get = get;
const closeAll = () => Promise.all(Array.from(pools.values()).map((connect) => {
    return connect.then((pool) => pool.close());
}));
exports.closeAll = closeAll;
//# sourceMappingURL=index.js.map