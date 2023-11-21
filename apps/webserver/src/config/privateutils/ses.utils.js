/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable default-case */
/* eslint-disable import/no-dynamic-require */
/** ******************************************************************
*   @name: ses.utils.js
*   @description : A utility file to allow calling various
* functionality from AWS SDK to create and
* send SES notifications
*
*   @function {sendEmail}

******************************************************************* */
// Imports for this module.
const path = require('path');
const AWS = require('aws-sdk');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const moment = require('moment');

const config = require('../config');

const langResources = require(path.resolve('./config/langResources'));
const errorUtils = require(path.resolve('./config/privateutils/error.utils'));
const emailUtil = require(path.resolve('./config/emailTemplates'));

const sesClient = new SESClient();
import { analysisTypesOptions } from '@wri-monorepos/constants';

const defineIcon = (type) => {
  switch (type) {
    case 'info':
      return 'https://dpptfqp76xood.cloudfront.net/images/pending_black_24dp.png';
    case 'error':
      return 'https://dpptfqp76xood.cloudfront.net/images/error_black_24dp.png';
    case 'success':
      return 'https://dpptfqp76xood.cloudfront.net/images/check_circle_black_24dp.png';
    case 'warning':
      return 'https://dpptfqp76xood.cloudfront.net/images/warning_black_24dp.png';
    default:
  }
};

const generateEmailTemplate = (level, title, msg, closing) => {
  return `
    <div style="padding-top: 2rem; text-align: center;">
      <img src="${defineIcon(level)}" border="0" align="center" class="g-img">
    </div>
    <div style="font-family: 'Fira Sans'; font-style: normal; font-weight: 600; font-size: 1.3rem; text-align: center; letter-spacing: 0.4px; color: rgba(0, 0, 0, 0.73);  padding: 35px;">
      ${title}
    </div>
    <div style="font-family: 'Fira Sans'; font-style: normal; font-weight: 400; font-size: 1rem; line-height: 1.6rem; text-align: center; letter-spacing: 0.25px; color: rgba(0, 0, 0, 0.54);">
      ${msg}
    </div>
    ${closing}
    `;
};

const createBodyContent = (req, type, content = {}, level = 'info') => {
  let title = '';
  let msg = '';
  let hasClosing = true;

  switch (type) {
    case config.platformVars.emailType.NEW_ORGANIZATION:
      title = `<h3>Dear GFW Pro Operations Administrator,</h3><p>Please visit pro.globalforestwatch.org/pro-manager to review the following application for a <b>GFW Pro</b> Account, submitted on ${moment().format(
        'DD MMM YYYY, hh:mm a'
      )}</p>`;
      msg =
        `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td><u>Account Information</u></td></tr><tr><td>Company Name:</td><td>${
          content.org_name
        }</td></tr>${
          content.is_subsidiary
            ? `<tr><td>Parent Company Name:</td><td>${content.parent_org_name}</td></tr>`
            : ''
        }<tr><td>Company Address:</td><td>${content.org_address}</td></tr>` +
        `<tr><td>Company Website:</td><td>${content.org_website}</td></tr>${
          content.policyNames.length > 0
            ? `<tr><td>Company Policy:</td><td>${content.policyNames.join(', ')}</td></tr>`
            : ''
        }<tr><td>Account Classifications:</td><td>${content.arr_org_classification_ids.join(
          ', '
        )}</td></tr></table><p />` +
        `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td><u>Account Manager</u></td></tr><tr><td>Name:</td><td>${content.user_first_name} ${content.user_last_name}</td></tr>` +
        `<tr><td>Email:</td><td>${content.user_email}</td></tr>` +
        `<tr><td>Phone:</td><td>${content.user_phone}</td></tr>` +
        `<tr><td>Title:</td><td>${content.user_title_id}</td></tr>${
          content.arr_user_geography_ids.length > 0
            ? `<tr><td>Geographies:</td><td>${content.arr_user_geography_ids.join(', ')}</td></tr>`
            : ''
        }${
          content.arr_user_commodity_ids.length > 0
            ? `<tr><td>Commodities:</td><td>${content.arr_user_commodity_ids.join(', ')}</td></tr>`
            : ''
        }</table><p />`;
      break;
    case config.platformVars.emailType.REQUEST_ORGANIZATION:
      title = `<h3>Dear ${content.user_first_name} ${content.user_last_name},</h3>`;
      msg =
        `<p>We received your GFW Pro Account application submitted on ${moment().format(
          'DD MMM YYYY, hh:mm a'
        )}.</p>` + '<p>We will review your application and respond within 2 business days.</p>';
      break;
    case config.platformVars.emailType.ORGANIZATION_ACTIVATED:
      title = `<h3>Dear ${content.user_first_name} ${content.user_last_name},</h3>`;
      msg = `<p>Welcome to Global Forest Watch Pro. Your account has been approved.' +
      'If this is your first time using the GFW Pro platform, you will be receiving a separate email with login instructions as well.</p>`;
      break;
    case config.platformVars.emailType.VERIFY_AUTHENTICATION:
      title = 'Dear GFW Pro User,';
      msg = `<p><b>Your verification code is: ${content.verification_code}</b></p><p>Please return to the GFW Pro login screen and input your code.</p>`;
      break;
    case config.platformVars.emailType.INVITATION:
      title = `<h3>Dear ${content.first_name} ${content.last_name},</h3>`;
      msg =
        '<p>You have been invited to join GFW Pro.</p><p>Please visit pro.globalforestwatch.org to sign in with your existing GFW Pro password.</p>';
      break;
    case config.platformVars.emailType.LIST_ANALYSIS_STARTED:
      title = "Now it's up to us";
      msg = `${content.analysis_types.join(
        ', '
      )} calculations are processing for <span style="font-weight: bold; color: rgba(0, 0, 0, 0.73);">${
        content.list_name
      }</span>. Analysis may take up to 24 hours. You will be notified by email when it's complete.`;
      hasClosing = false;
      break;
    case config.platformVars.emailType.LIST_ANALYSIS_RERUN_SUCCESS:
      title = `Dear ${req.session.user_first_name} ${req.session.user_last_name},`;
      msg = `Diagnostics and List Views rerun process for the GFW Pro list ${content.list_name} has started and will be completed shortly. Please expect email notification upon completion.`;
      break;
    case config.platformVars.emailType.LIST_ANALYSIS_ERROR:
      title = 'Unable to process';
      msg =
        `<p>Diagnostic and List View calculations failed for the GFW Pro list <span style="font-weight: bold; color: rgba(0, 0, 0, 0.73);">${content.list_name}</span>.</p>` +
        '<p>Try again and if the problem persists please contact GFW Pro support at <a href="mailto:gfwprosupport@wri.org">gfwprosupport@wri.org</a> for further information.</p>';
      hasClosing = false;
      break;
    case config.platformVars.emailType.ORGANIZATION_APPROVED:
      title = `Dear ${content.user_first_name} ${content.user_last_name},</h3><p>Thank you for your GFW Pro account application.</p><p>We are pleased to inform you that your profile has been activated.</p><p>You will receive a separate email with your username and a temporary password.</p>`;
      msg =
        `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td><u>Account Profile</u></td></tr><tr><td>Company Name:</td><td>${
          content.org_name
        }</td></tr>${
          content.is_subsidiary
            ? `<tr><td>Parent Company Name:</td><td>${content.parent_org_name}</td></tr>`
            : ''
        }<tr><td>Company Address:</td><td>${content.org_address}</td></tr>` +
        `<tr><td>Company Website:</td><td>${content.org_website}</td></tr>${
          content.policyNames.length > 0
            ? `<tr><td>Company Policy:</td><td>${content.policyNames.join(', ')}</td></tr>`
            : ''
        }<tr><td>Account Classifications:</td><td>${content.arr_org_classification_ids.join(
          ', '
        )}</td></tr></table><p />` +
        `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td><u>User Profile</u></td></tr><tr><td>Name:</td><td>${content.user_first_name} ${content.user_last_name}</td></tr>` +
        `<tr><td>Email:</td><td>${content.user_email}</td></tr>` +
        `<tr><td>Phone:</td><td>${content.user_phone}</td></tr>` +
        `<tr><td>Title:</td><td>${content.user_title_id}</td></tr>${
          content.arr_user_geography_ids.length > 0
            ? `<tr><td>Geographies:</td><td>${content.arr_user_geography_ids.join(', ')}</td></tr>`
            : ''
        }${
          content.arr_user_commodity_ids.length > 0
            ? `<tr><td>Commodities:</td><td>${content.arr_user_commodity_ids.join(', ')}</td></tr>`
            : ''
        }</table><p /><p>Navigate to pro.globalforestwatch.org to log in to GFW Pro.</p>`;
      break;
  }

  const closing = hasClosing ? '<p>Sincerely,<br>Global Forest Watch Pro</p>' : '';
  const bodyContent = generateEmailTemplate(level, title, msg, closing);
  return emailUtil.createPage(bodyContent);
};

const initialize = () => {
  const objTemp = {
    accessKeyId: config.AWSVars.credentials.accessKey,
    secretAccessKey: config.AWSVars.credentials.secretKey,
    region: config.AWSVars.cognito.region,
  };
  // Setup the AWS Config with the proper credentials.
  AWS.config.update(objTemp);
};

const sendEmail = (req, sender, receivers, subject, content) => {
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

    const command = new SendEmailCommand(parameters);
    sesClient
      .send(command)
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log('Error sending email', err);
        const userMessage = langResources.getResourceString('failedToSendEmail');
        const sysMessage = `Error Send Email: ${err}`;
        const errObj = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToSendEmail,
          userMessage,
          sysMessage
        );
        reject(errObj);
      });
  });
  return promise;
};

const sendEmail__ListSubmittedForAnalysis = (req, list_name, analysis_types) => {
  const { user_email } = req.session;
  const formattedAnalysisTypes = Object.keys(analysis_types).map(
    (analysisTypeId) => analysisTypesOptions.find(({ id }) => analysisTypeId === id).shortLabel
  );
  const content = {
    list_name,
    analysis_types: formattedAnalysisTypes,
  };
  const subject = `${formattedAnalysisTypes.join(
    ', '
  )} calculations are processing for the GFW Pro list ${list_name}`;
  const msg = createBodyContent(req, config.platformVars.emailType.LIST_ANALYSIS_STARTED, content);
  return sendEmail(req, config.AWSVars.ses.sender, [user_email], subject, msg);
};

module.exports = {
  initialize,
  sendEmail,
  createBodyContent,
  sendEmail__ListSubmittedForAnalysis,
};
