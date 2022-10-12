import * as AWS from 'aws-sdk';

import { ErrorException, ErrorCode } from '@wri-monorepos/util';

import { generateEmailForB2B, generateEmailForFile }  from './generateEmailMessage';

/**
 * @function sendEmail
 * @summary Function to send SES notifications
 * @param {String} sender
 * @param {Array} receivers
 * @param {String} subject
 * @param {String} content
 * @return {Promise}
 */

const sendEmail = (sender: string, receivers: Array<string>, subject: string, content: string) => {
  const ses = new AWS.SES({
    apiVersion: '2010-12-01',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
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
        const errObj = new ErrorException( ErrorCode.InternalServerError, { message:`${userMessage}|${sysMessage}` });
        reject(errObj);
      } else {
        resolve(data);
      }
    });
  });
  return promise;
}


export const sendEmailFile = (sender: string, receivers: Array<string>, subject: string, type: string, filter: any) => {
  const content = generateEmailForFile(type, filter);
  sendEmail(sender, receivers, subject, content);
};


export const sendEmailB2B =  (sender: string, receivers: Array<string>, subject: string, type: string, target: any) => {
  const content = generateEmailForB2B(type, target);
  sendEmail(sender, receivers, subject, content);
}