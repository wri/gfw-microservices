export const deduceActiveName = (activeTemplate) => {
  let template_name;
  switch (activeTemplate) {
    case 'palmMill':
      template_name = 'Palm Oil Mill';
      break;
    case 'palmPlantation':
      template_name = 'Palm Oil Plantation';
      break;
    case 'palmFarm':
      template_name = 'Palm Smallholder Farm';
      break;
    case 'palmGeneric':
      template_name = 'Palm Oil Generic';
      break;
    case 'soySilo':
      template_name = 'Soy Silo';
      break;
    case 'soyFarm':
      template_name = 'Soy Farm';
      break;
    case 'soyGeneric':
      template_name = 'Soy Generic';
      break;
    case 'beef':
      template_name = 'Beef Slaughterhouse';
      break;
    case 'cattle':
      template_name = 'Cattle Ranch';
      break;
    case 'cattleGeneric':
      template_name = 'Cattle Generic';
      break;
    case 'cocoa':
      template_name = 'Cocoa Farm';
      break;
    case 'cocoaGeneric':
      template_name = 'Cocoa Generic';
      break;
    case 'coffee':
      template_name = 'Coffee';
      break;
    case 'rubber':
      template_name = 'Rubber';
      break;
    case 'pulp':
      template_name = 'Pulp and Paper';
      break;
    case 'soy':
      template_name = 'Soy';
      break;
    case 'sugarCane':
      template_name = 'Sugar Cane';
      break;
    case 'other':
      template_name = 'Other';
      break;
    default:
      template_name = 'Other';
  }
  return template_name;
};

export const deduceActiveId = (activeTemplate) => {
  let templateId;
  switch (activeTemplate) {
    case 'palmMill':
      templateId = 2;
      break;
    case 'palmPlantation':
      templateId = 3;
      break;
    case 'palmFarm':
      templateId = 4;
      break;
    case 'palmGeneric':
      templateId = 5;
      break;
    case 'soySilo':
      templateId = 6;
      break;
    case 'soyFarm':
      templateId = 7;
      break;
    case 'soyGeneric':
      templateId = 8;
      break;
    case 'beef':
      templateId = 9;
      break;
    case 'cattle':
      templateId = 10;
      break;
    case 'cattleGeneric':
      templateId = 11;
      break;
    case 'cocoa':
      templateId = 12;
      break;
    case 'cocoaGeneric':
      templateId = 13;
      break;
    case 'other':
      templateId = 14;
      break;
    case 'generic':
      templateId = 14;
      break;
    case 'investment':
      templateId = 1;
      break;
    default:
      templateId = 1;
  }
  return templateId;
};
