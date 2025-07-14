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
};

export const ExternalLinks = {
  ZendeskSupport: 'https://gfwpro.zendesk.com/hc/en-us/requests/new',
  UploadListHelpCenter: 'https://globalforestwatch.org/help/gfw-pro/guides/upload-locations-lists',
  HowToFormatLocationData:
    'https://globalforestwatch.org/help/gfw-pro/guides/complete-selected-template',
};
