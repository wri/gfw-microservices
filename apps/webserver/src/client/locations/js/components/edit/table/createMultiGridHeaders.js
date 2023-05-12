import difference from 'lodash/difference';
import { locationsPage } from '../../../../../common/js/config';
import { EXCLUDED_COLUMNS } from '../../../../../common/js/constants/lists.constants';
import { STEP_ONE_EDIT_EXCLUDED_ATTRIBUTES } from '../StepOneEdit.util';

const createMultiGridHeaders = (
  addType,
  activeTemplate,
  commodityType,
  customAttributeHeaders,
  templateData,
  isListExcluded
) => {
  const headerArray = [];
  let headerKey;

  locationsPage.tableKeyArray.forEach((object) => {
    let active = activeTemplate;

    if (addType === 'commodity' && active === 'investment') {
      if (commodityType === 'palmOil') {
        active = 'palmGeneric';
      } else if (commodityType === 'soy') {
        active = 'soyGeneric';
      } else if (commodityType === 'cattle') {
        active = 'cattleGeneric';
      } else if (commodityType === 'cocoa') {
        active = 'cocoaGeneric';
      }
    }
    if (object.activeTemplate === active) {
      headerKey = object.templateDataValue;
    }
  });

  templateData.forEach((data) => {
    if (data.template_name === headerKey) {
      if (['gadmid', ...STEP_ONE_EDIT_EXCLUDED_ATTRIBUTES].includes(data.template_datum_field_name)) {
        return;
      }
      if (data.template_datum_field_name === 'Attribute1') {
        if (customAttributeHeaders[0].custom !== 'Attribute1') {
          data.template_datum_field_name_updated = customAttributeHeaders[0].custom;
          headerArray.push(data.template_datum_field_name_updated);
        }
      } else if (data.template_datum_field_name === 'Attribute2') {
        if (customAttributeHeaders[1].custom !== 'Attribute2') {
          data.template_datum_field_name_updated = customAttributeHeaders[1].custom;
          headerArray.push(data.template_datum_field_name_updated);
        }
      } else if (data.template_datum_field_name === 'Attribute3') {
        if (customAttributeHeaders[2].custom !== 'Attribute3') {
          data.template_datum_field_name_updated = customAttributeHeaders[2].custom;
          headerArray.push(data.template_datum_field_name_updated);
        }
      } else if (
        addType === 'commodity' &&
        data.template_datum_field_name !== 'Wind Barrier' &&
        data.template_datum_field_name !== 'Riparian Buffers' &&
        data.template_datum_field_name !== 'Buffer Zones'
      ) {
        headerArray.push(data.template_datum_field_name);
      } else if (addType === 'investment') {
        headerArray.push(data.template_datum_field_name);
      }
    }
  });

  return isListExcluded ? difference(headerArray, EXCLUDED_COLUMNS) : headerArray;
};

export default createMultiGridHeaders;
