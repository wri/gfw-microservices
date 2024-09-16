/*
  Templates corresponding to template_id numbers:
  1 Investment
  2 Palm Oil Mill
  3 Palm Oil Plantation
  4 Palm Smallholder Farm
  5 Palm Oil Generic
  6 Soy Silo
  7 Soy Farm
  8 Soy Generic
  9 Beef Slaughterhouse
  10 Cattle Ranch
  11 Cattle Generic
  12 Cocoa Farm
  13 Cocoa Generic
  14 Other
*/

/**
 * Templates for Excel file that have column 'Location Classification' Mandatory
 * checkLocationClassificationValidity([locations], templateDescription)
 * @type {string[]}
 */
export const excelLocationClassificationMandatory = [
  'Cattle Generic',
  'Cocoa Generic',
  'Palm Oil Generic',
  'Pulp and Paper',
  'Rubber',
  'Soy Generic',
  'Sugar Cane',
  'Generic',
  'Other',
];

/**
 * Excluded Excel templates that don't need 'Location Classification' field populated
 * @type {string[]}
 */
export const excelLocationClassificationExcluded = [
  'Investment',
  'Palm Oil Mill',
  'Beef Slaughterhouse',
  'Cattle Ranch',
  'Cocoa Farm',
  'Palm Oil Mill',
  'Palm Oil Plantation',
  'Palm Smallholder Farm',
  'Soy Silo',
  'Soy Farm',
];
