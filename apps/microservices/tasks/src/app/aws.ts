import { Consumer } from 'sqs-consumer';
import * as AWS from 'aws-sdk';
import * as fsp from 'fs';

import { logger } from './logger';
import { createErrorMessage } from './util';

// eslint-disable-next-line @typescript-eslint/ban-types
export const connectToSQS = (func: Function) => {
  const awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  };
  AWS.config.update(awsConfig);

  const queueUrl = process.env.AWS_TMP_QUEUE;

  const app = Consumer.create({
    queueUrl,
    handleMessage: async (message) => {
      func(message);
    },
    sqs: new AWS.SQS(),
    batchSize: 10,
  });

  app.on('error', (err) => {
    console.error(err.message);
  });

  app.on('processing_error', (err) => {
    console.error(err.message);
  });
  
  logger.info('Emails service is running');
  app.start();
};

export const sendCSVtoS3 = async (key: string, fileExtension: string, contentType: string) => {
  const s3 = new AWS.S3({
    apiVersion: 'v2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
  });

  const fileContent = fsp.readFileSync(`/tmp/${key}.${fileExtension}`);
  const params = {
    Bucket: process.env.AWS_TMP_BUCKET,
    Key: `${process.env.NODE_ENV}/${key}.${fileExtension}`,
    Body: fileContent,
    ContentType: contentType,
  };

  await s3.upload(params).promise();
};

export const getFileSignedUrl = async (key: string, fileExtension: string) => {
  const s3 = new AWS.S3({
    signatureVersion: 'v4',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
  });

  const params = {
    Bucket: process.env.AWS_TMP_BUCKET,
    Key: `${process.env.NODE_ENV}/${key}.${fileExtension}`,
    Expires: 86400,
  };

  const url = await s3.getSignedUrl('getObject', params);
  return url;
};

const createPage = (bodyContent:string) =>
  `<!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">
  
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title></title>
    <link href="https://fonts.googleapis.com/css?family=Fira+Sans" rel="stylesheet" type="text/css">
  </head>
  <body width="100%" style="margin: 0; mso-line-height-rule: exactly; background-color: #ffffff;">
    <center style="width: 100%; background-color: #ffffff; text-align: left;">
      <div
        style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: 'Fira Sans', sans-serif;">
        &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
      </div>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="600"
        style="margin: auto;" class="email-container">
        <tr>
          <td style="padding: 20px 0; text-align: center"></td>
        </tr>
      </table>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="600"
        style="margin: auto;" class="email-container">
        <tr>
          <td align="center" style="background-color: #ffffff;"><img
              src="https://dpptfqp76xood.cloudfront.net/images/gfw-pro-email-banner.jpg" width="600" height=""
              alt="alt_text" border="0" align="center"
              style="width: 100%; max-width: 600px; height: auto; background: #dddddd; font-family: 'Fira Sans', sans-serif; font-size: 15px; line-height: 140%; color: #555555; margin: auto;"
              class="g-img"></td>
        </tr>
        <tr>
          <td style="background-color: #ffffff;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td
                  style="padding: 40px 40px 20px; font-family: 'Fira Sans', sans-serif; font-size: 15px; line-height: 140%; color: #555555;">
                  <section
                    style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0.5rem;"
                  >
                    ${bodyContent}
                  </section>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%"
          style="max-width: 600px;">
          <tr>
            <td
              style="padding: 15px 10px; font-family: 'Fira Sans', sans-serif; font-size: 12px; line-height: 140%; text-align: center; color: #888888;">
              <br><br>Global Forest Watch Pro is a project of the World Resources Institute<br><span
                class="unstyle-auto-detected-links">10 G Street NE Suite 800, Washington DC, 20002, USA<br>+1 (202)
                729-7600<br><a href="https://www.wri.org/" style="text-decoration: none; color: #97BD3D;">www.wri.org</a></span><br><br>
              <hr /><span>Privacy Policy | Terms and Conditions</span>
            </td>
          </tr>
        </table>
    </center>
  </body>
  </html>`;

/**
 * @function generateEmailTemplate
 * @summary Function to create email templates for SES message body
 * @param {Object} req - Express request object
 * @param {String} type - Indicating which type of template to be generated
 * @param {Object} content - Object with properties to inject into templates
 * @return {String} Stringified HTML page
 */
export const generateEmailTemplate = (type: string, filter: any): string => {
  const { listName, location } = filter;
  
  const emailMessage = {
    start: `
    <div style="padding-top: 2rem; text-align: center;">
      <img src="https://dpptfqp76xood.cloudfront.net/images/pending_black_24dp.png"  alt="alt_text" border="0" align="center" class="g-img">
    </div>
    <div style="font-family: 'Fira Sans'; font-style: normal; font-weight: 600; font-size: 1.3rem; text-align: center; letter-spacing: 0.4px; color: rgba(0, 0, 0, 0.73);  padding: 35px;">
      We start to generate the file
    </div>
    <div style="font-family: 'Fira Sans'; font-style: normal; font-weight: 400; font-size: 1rem; line-height: 1.6rem; text-align: center; letter-spacing: 0.25px; color: rgba(0, 0, 0, 0.54);">
      Pro system starting capturing data from the server and is generating your file with the data of the list ${listName}.
    </div>
    `,
    finish: `
    <div style="padding-top: 2rem; text-align: center;">
      <img src="https://dpptfqp76xood.cloudfront.net/images/check_circle_black_24dp.png"  alt="alt_text" border="0" align="center" class="g-img">
    </div>
    <div style="font-family: 'Fira Sans'; font-style: normal; font-weight: 600; font-size: 1.3rem; text-align: center; letter-spacing: 0.4px; color: rgba(0, 0, 0, 0.73);  padding: 35px;">
      We finished to generate your file
    </div>
    <div style="font-family: 'Fira Sans'; font-style: normal; font-weight: 400; font-size: 1rem; line-height: 1.6rem; text-align: center; letter-spacing: 0.25px; color: rgba(0, 0, 0, 0.54);">
      Pro system starting capturing data from the server and is generating yout file.
    </div>
    <div style="font-family: 'Inter'; font-style: normal; font-weight: 400; font-size: 1rem; line-height: 1.2rem; color: #000000; text-transform: uppercase; padding: 3rem; text-align: center; padding: 20px;">
      DOWNLOAD WITHIN 24 HOURS
    </div>
    <div
      style="
        width: 80%;
        margin: auto;
        border-radius: 8px;
        background-color: rgba(240,240,240,0.8);
        padding: 1rem;
      "
    >
        <div
          style="width: 20%; display: inline-block; height:inherit; text-align: center;"
        >
          <img src="https://dpptfqp76xood.cloudfront.net/images/folder_zip_black_24dp.png"  alt="alt_text" border="0" align="center" class="g-img">
        </div>
        <div
          style="width: 80%; display: inline-block; height:inherit; text-align: center;"
        >
          <a style="text-decoration: none; color: black; font-weight: 600; " href="${location}"> Data for ${listName} </a>
        </div>
    <div>
    `,
    error: `
    <div style="padding-top: 2rem; text-align: center;">
      <img src="https://dpptfqp76xood.cloudfront.net/images/warning_black_24dp.png"  alt="alt_text" border="0" align="center" class="g-img">
    </div>
    <div style="font-family: 'Fira Sans'; font-style: normal; font-weight: 600; font-size: 1.3rem; text-align: center; letter-spacing: 0.4px; color: rgba(0, 0, 0, 0.73); padding: 35px;">
      We have a problem to generate your file
    </div>
    <div style="font-family: 'Fira Sans'; font-style: normal; font-weight: 400; font-size: 1rem; line-height: 1.6rem; text-align: center; letter-spacing: 0.25px; color: rgba(0, 0, 0, 0.54);">
      The pro system had some problem to generate you file with the data of the list ${listName}. Please try again.
    </div>
    `
  };

  // return page;
  return createPage(emailMessage[type]);
};

/**
 * @function sendEmail
 * @summary Function to send SES notifications
 * @param {String} sender
 * @param {Array} receivers
 * @param {String} subject
 * @param {String} content
 * @return {Promise}
 */
 export const sendEmail = (sender: string, receivers: Array<string>, subject: string, type: string, filter: any) => {
  const content = generateEmailTemplate(type, filter);
  const ses = new AWS.SES({
    apiVersion: '2010-12-01',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
  });

  const promise = new Promise((resolve, reject) => {
    const parameters = {
      Destination: {
        ToAddresses: receivers,
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: content,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: sender,
    };

    ses.sendEmail(parameters, (err, data) => {
      if (err) {
        console.log('Error sending email', err);
        const userMessage = 'Failed to send email.';
        const sysMessage = `Error Send Email: ${err}`;
        const errObj = createErrorMessage(110, userMessage, sysMessage);
        reject(errObj);
      } else {
        resolve(data);
      }
    });
  });
  return promise;
};
