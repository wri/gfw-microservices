const listErrorUtils = require('../utils/listError.utils');
const { info, error } = require('../../../config/privateutils/logger.utils');

exports.listError = async (request, response) => {
  info(`/listError - Request => PARAMS: ${JSON.stringify(request.params)}`);

  try {
    const listId = parseInt(request.params.id, 10);
    const result = await listErrorUtils.getListErrorFiles(request, parseInt(listId, 10));
    if (Object.hasOwnProperty.call(request.params, 'id')) {
      const [first] = result;
      first.id = listId;
      response.status(200).json(first);
    }
    response.status(200).json(result);
  } catch (err) {
    error(`Getting list error path failed. Error message ${err}`);
    response.status(500).json({
      status: 500,
      message: 'Error occurred while paths of the error files.',
      error: err,
    });
  }
};
