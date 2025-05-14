export const CONVERTER_NAMES = {
  LIST_SCHEMA: 'List Schema',
  GADM_VERSION: 'GADM Version',
  EXAMPLE_CONVERTER: 'Example Converter',
} as const;

export type ConverterName = (typeof CONVERTER_NAMES)[keyof typeof CONVERTER_NAMES];

export const ConverterNamesList: ConverterName[] = Object.values(CONVERTER_NAMES);
