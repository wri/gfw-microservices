export const DATA_API_URL = location.origin;

// New analysis types that utilize GFW API geostore ID
export const supportedGeostoreAnalysis = ['tree cover', 'glad', 'tree biomass', 'viirs', 'prodes'];

// Geostore admin URL
export const baseGeostoreURL = 'https://production-api.globalforestwatch.org/v2/geostore/';

export const GFW_PRO_USER_GUIDE = 'https://www.globalforestwatch.org/help/gfw-pro/';
export const GFW_PRO_HELP_CENTER__LINK = 'https://www.globalforestwatch.org/help/pro-login/';
export const GFW_PRO_HELP_CENTER__LABEL = 'Help Center';

export const pro_AWS_base = 'https://dpptfqp76xood.cloudfront.net';
export const aws_templates = `${pro_AWS_base}/templates/`;

export const termsAndConditions =
  'https://d1ps9kreypzu9a.cloudfront.net/Training%20Guides/GFW%20Pro%20Landing%20Page/World%20Resources%20Institute%20-%20GFW%20Pro%20-%20Terms%20of%20Service%207_2_2018.pdf';

export const termsOfServices = 'https://www.wri.org/about/legal-notices';

export const privacyPolicy = 'https://www.wri.org/about/privacy-policy';

export const licenseAgreement =
  'https://www.globalforestwatch.org/help/guides/global-forest-watch-pro-license-agreement/';

export const priceSheet =
  'https://www.globalforestwatch.org/help/guides/global-forest-watch-pro-price-sheet/';

export const sharedUrlDict = {
  gfwHeaderUrl: `${pro_AWS_base}/js/gfw-assets.nightly.js`,
};
