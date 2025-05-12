const path = require('path');
const { CONVERTER_NAMES } = require(path.resolve('./libs/constants/src/lib/converters.constants'));

export const getConverters = (req, res) => {
  res.status(200).json({ converters: CONVERTER_NAMES });
};
