const AWS = require('aws-sdk');
/**
 * @summary handles afi analysis endpoint
 * @param {Object} req Express Request
 * @param {Object} res Express Respond
 */

module.exports = (req, res) => {
  const { listId } = req.query;

  if (!listId) {
    return res.status(400).send('Missing listId');
  }

  const fileKey = `s3://gfwpro-lpl-dev/19g61lhf2263y-ghana_64k_cocoa_generic.zip`;
  const basename = path.basename(fileKey);
  const bucket = path.parse(fileKey).dir.replace(/[sS]3:(\/)+/g, '');
  console.log('Trying to download file', fileKey);
  const s3 = new AWS.S3();
  const options = {
    Bucket: bucket,
    Key: basename,
  };

  res.attachment(fileKey);
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=' + `${basename}.zip`);
  const fileStream = s3.getObject(options).createReadStream();
  fileStream.pipe(res);
};
