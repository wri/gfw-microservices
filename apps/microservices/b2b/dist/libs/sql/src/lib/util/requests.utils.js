"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestAnalysisProcess = void 0;
const node_fetch_1 = require("node-fetch");
const AWS_ANALYSIS_LAMBDA_URL = process.env.AWS_ANALYSIS_LAMBDA_URL;
const requestAnalysisProcess = (requestBody) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    };
    return (0, node_fetch_1.default)(AWS_ANALYSIS_LAMBDA_URL, options);
};
exports.requestAnalysisProcess = requestAnalysisProcess;
//# sourceMappingURL=requests.utils.js.map