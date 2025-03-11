import store from '../../../locations/js/store';
import { changeAddType, changeTemplate } from '../../../locations/js/actions/locationActions';

/**
 * Update Add Type
 *
 * @param {Object} templateData - Selected List template Data
 * @param {string} activeTemplate - Current active Template
 */
export function updateAddType(templateData, activeTemplate) {
  let addType;

  if (templateData && templateData.location_type_name === 'Investment') {
    addType = 'investment';
  } else if (templateData) {
    addType = 'commodity';
  } else if (activeTemplate === 'investment') {
    addType = 'investment';
  } else {
    addType = 'commodity';
  }

  store.dispatch(changeAddType(addType));
}

/**
 * Update GFW Pro list Active Template
 *
 * @param {Object} selectedList - Selected GFW Pro List data
 * @return {string} - Commodity type
 */
export function updateGFWListActiveTemplate(selectedList) {
  let activeTemplate;
  let commodityType;

  switch (selectedList.list_name) {
    case 'RSPO Palm Concessions':
      commodityType = 'palmOil';
      activeTemplate = 'palmGeneric';
      break;
    case 'Oil Palm Concessions':
      commodityType = 'palmOil';
      activeTemplate = 'palmGeneric';
      break;
    case 'Palm Oil Mills':
      commodityType = 'palmOil';
      activeTemplate = 'palmMill';
      store.dispatch(changeAddType('commodity'));
      break;
    default:
      commodityType = 'cattle';
      activeTemplate = 'cattleGeneric';
      break;
  }

  store.dispatch(changeTemplate(activeTemplate));

  return commodityType;
}

/**
 * Update Regular list Active Template
 *
 * @param {Object} templateData - Selected List template Data
 */
export function updateRegularListActiveTemplate(templateData) {
  let activeTemplate;

  if (templateData.template_id === 1) {
    activeTemplate = 'investment';
  } else {
    switch (templateData.template_name) {
      case 'Palm Oil Mill':
        activeTemplate = 'palmMill';
        break;
      case 'Palm Oil Plantation':
        activeTemplate = 'palmPlantation';
        break;
      case 'Palm Smallholder Farm':
        activeTemplate = 'palmFarm';
        break;
      case 'Palm Oil Generic':
        activeTemplate = 'palmGeneric';
        break;
      case 'Soy Silo':
        activeTemplate = 'soySilo';
        break;
      case 'Soy Farm':
        activeTemplate = 'soyFarm';
        break;
      case 'Soy Generic':
        activeTemplate = 'soyGeneric';
        break;
      case 'Beef Slaughterhouse':
        activeTemplate = 'beef';
        break;
      case 'Cattle Ranch':
        activeTemplate = 'cattle';
        break;
      case 'Cattle Generic':
        activeTemplate = 'cattleGeneric';
        break;
      case 'Cocoa Farm':
        activeTemplate = 'cocoa';
        break;
      case 'Cocoa Generic':
        activeTemplate = 'cocoaGeneric';
        break;
      default:
        activeTemplate = 'generic';
    }
  }

  store.dispatch(changeTemplate(activeTemplate));
}
