import { CONVERTER_NAMES } from '@wri-monorepos/constants';

export const getConverters = (req, res) => {
  res.status(200).json({ converters: CONVERTER_NAMES });
};
