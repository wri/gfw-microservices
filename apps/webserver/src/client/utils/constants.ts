import { UploadType } from '../locations/js/components/newLocationUpload/types';

export const DATA_CY = {
  NEW_UPLOAD_WORKFLOW: {
    ADD: 'nuw_add',
    DATA_TEMPLATES: 'nuw_data_templates',

    [UploadType.ByFile]: {
      ADD: 'nuw_add_file',
      LOCATION_NEXT: 'nuw_add_file_location_next',
      LOCATION_CANCEL: 'nuw_add_file_location_cancel',
      PREVIEW_NEXT: 'nuw_add_file_preview_next',
      PREVIEW_RETRY: 'nuw_add_file_preview_retry',
      PREVIEW_CANCEL: 'nuw_add_file_preview_cancel',
      CONFIGURE_NEXT: 'nuw_add_file_configure_next',
      CONFIGURE_CANCEL: 'nuw_add_file_configure_cancel',
      SUBMIT_ANALYSIS: 'nuw_add_file_submit_analysis',
      SUBMIT_CANCEL: 'nuw_add_file_submit_cancel',
      SUBMIT_DRAFT: 'nuw_add_file_submit_draft',
    },
    [UploadType.ById]: {
      ADD: 'nuw_add_file_byid',
      LOCATION_NEXT: 'nuw_add_file_byid_location_next',
      LOCATION_CANCEL: 'nuw_add_file_byid_location_cancel',
      PREVIEW_NEXT: 'nuw_add_file_byid_preview_next',
      PREVIEW_RETRY: 'nuw_add_file_byid_preview_retry',
      PREVIEW_CANCEL: 'nuw_add_file_byid_preview_cancel',
      CONFIGURE_NEXT: 'nuw_add_file_byid_configure_next',
      CONFIGURE_CANCEL: 'nuw_add_file_byid_configure_cancel',
      SUBMIT_ANALYSIS: 'nuw_add_file_byid_submit_analysis',
      SUBMIT_CANCEL: 'nuw_add_file_byid_submit_cancel',
      SUBMIT_DRAFT: 'nuw_add_file_byid_submit_draft',
    },
    [UploadType.ByPoint]: {
      ADD: 'nuw_add_point',
      LOCATION_NEXT: 'nuw_add_point_location_next',
      LOCATION_CANCEL: 'nuw_add_point_location_cancel',
      CONFIGURE_NEXT: 'nuw_add_point_configure_next',
      CONFIGURE_CANCEL: 'nuw_add_point_configure_cancel',
      SUBMIT_ANALYSIS: 'nuw_add_point_submit_analysis',
      SUBMIT_CANCEL: 'nuw_add_point_submit_cancel',
      SUBMIT_DRAFT: 'nuw_add_point_submit_draft',
    },
    [UploadType.ByPolygon]: {
      ADD: 'nuw_add_polygon',
      LOCATION_NEXT: 'nuw_add_polygon_location_next',
      LOCATION_CANCEL: 'nuw_add_polygon_location_cancel',
      CONFIGURE_NEXT: 'nuw_add_polygon_configure_next',
      CONFIGURE_CANCEL: 'nuw_add_polygon_configure_cancel',
      SUBMIT_ANALYSIS: 'nuw_add_polygon_submit_analysis',
      SUBMIT_CANCEL: 'nuw_add_polygon_submit_cancel',
      SUBMIT_DRAFT: 'nuw_add_polygon_submit_draft',
    },
  },
  LANDING: {
    ADMINISTRATIVE_AREA: 'landing_gfw_administrative_areas',
    OIL_PALM_CONCESSIONS: 'landing_gfw_oil_palm_concessions',
    PALM_OIL_MILLS: 'landing_gfw_palm_oil_mills',
    PROTECTED_AREAS: 'landing_gfw_protected_areas',
    RSPO_PALM_CONCESSIONS: 'landing_gfw_rspo_palm_concessions',
  },
};

export const ExternalLinks = {
  ZendeskSupport: 'https://gfwpro.zendesk.com/hc/en-us/requests/new',
  UploadListHelpCenter: 'https://globalforestwatch.org/help/gfw-pro/guides/upload-locations-lists',
  HowToFormatLocationData:
    'https://globalforestwatch.org/help/gfw-pro/guides/complete-selected-template',
  UploadStepByStepInstructions: 'https://globalforestwatch.org/help/gfw-pro/guides',
  HowToAddressErrorsInUpload:
    'https://globalforestwatch.org/help/gfw-pro/guides/how-to-address-errors-in-your-uploads',
  UploadFees: 'https://pro.globalforestwatch.org/about?section=Fees',
};

export const ReusableText = {
  EudrLegalDisclaimer:
    'Our services do not provide certification or guarantee that any deforestation-related activities, data, or supply chains comply with the European Union Deforestation Regulation (EUDR). Compliance with EUDR requirements remains the sole responsibility of the relevant parties, and we recommend consulting with appropriate legal and regulatory experts for verification and certification. ',
};
