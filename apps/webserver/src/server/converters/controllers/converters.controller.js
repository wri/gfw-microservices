import { ConverterNamesList } from '@wri-monorepos/constants';

export const getConverters = (req, res) => {
  res.status(200).json({ converters: ConverterNamesList });
};
