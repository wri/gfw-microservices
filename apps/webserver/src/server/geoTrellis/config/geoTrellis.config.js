const AWS_LAMBDA_LINK = 'https://q9z0ihxlda.execute-api.us-east-1.amazonaws.com';

// DEVELOPMENT Links
module.exports.GEO_TRELLIS__ANALYZE_LIST_DEV = AWS_LAMBDA_LINK + '/AnalyzeList/latest';

// QA Links
module.exports.GEO_TRELLIS__ANALYZE_LIST_QA = AWS_LAMBDA_LINK + '/AnalyzeList/qa';

// STAGING Links
module.exports.GEO_TRELLIS__ANALYZE_LIST_STAGING = AWS_LAMBDA_LINK + '/AnalyzeList/staging';

// PRODUCTION Links
module.exports.GEO_TRELLIS__ANALYZE_LIST_PROD = AWS_LAMBDA_LINK + '/AnalyzeList/production';

// ProdV2 Links
module.exports.GEO_TRELLIS__ANALYZE_LIST_PRODV2 = AWS_LAMBDA_LINK + '/AnalyzeList/prodv2';
