/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable default-case */
/* ******************************************************************
*   @name: ses.utils.js
*   @description : A utility file to allow calling various
*     functionalities from AWS SDK to create and
*     send SES notifications
*
*   @function {sendEmail}

******************************************************************* */
// Imports for this module.
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { format: formatDate } = require('date-fns');

import config from '../config';

import langResources from '../langResources';
import { createErrorMessage, ERROR_CODES } from '../privateutils/error.utils';
import emailUtil from '../emailTemplates';

const sesClient = new SESClient();
import { analysisTypesOptionsNewNames } from '@wri-monorepos/constants';

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
    case 'limit':
      return 'https://dpptfqp76xood.cloudfront.net/images/speed_black_24dp.png';
    default:
  }
};

const generateEmailTemplate = (level, title, msg, closing) => {
  return `
    <div style="padding-top: 2rem; text-align: center;">
      <img src="${defineIcon(level)}" border="0" align="center" class="g-img">
    </div>
    <div style="font-family: 'Fira Sans,Arial,sans-serif'; font-style: normal; font-weight: 600; font-size: 1.3rem; text-align: center; letter-spacing: 0.4px; color: rgba(0, 0, 0, 0.73);  padding: 35px;">
      ${title}
    </div>
    <div style="font-family: 'Fira Sans,Arial,sans-serif'; font-style: normal; font-weight: 400; font-size: 1rem; line-height: 1.6rem; text-align: center; letter-spacing: 0.25px; color: rgba(0, 0, 0, 0.54);">
      ${msg}
    </div>
    ${closing}
    `;
};

export const createBodyContent = (req, type, content = {}, level = 'info') => {
  let title = '';
  let msg = '';
  let hasClosing = true;

  switch (type) {
    case config.platformVars.emailType.NEW_ORGANIZATION:
      title = `<h3>Dear GFW Pro Operations Administrator,</h3><p>Please visit pro.globalforestwatch.org/pro-manager to review the following application for a <b>GFW Pro</b> Account, submitted on ${formatDate(
        new Date(),
        'dd MMM yyyy, hh:mm a'
      )}</p>`;
      msg =
        `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td><u>Account Information</u></td></tr><tr><td>Company Name:</td><td>${
          content.org_name
        }</td></tr>${
          content.is_subsidiary
            ? `<tr><td>Parent Company Name:</td><td>${content.parent_org_name}</td></tr>`
            : ''
        }<tr><td>Company Address:</td><td>${content.org_address}, ${
          content.org_country
        }</td></tr>` +
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
        `<p>We received your GFW Pro Account application submitted on ${formatDate(
          new Date(),
          'dd MMM yyyy, hh:mm a'
        )}.</p>` +
        '<p>We will review your application. Once approved and activated, we will notify you and provide a temporary password to access your account.</p>';
      break;
    case config.platformVars.emailType.ORGANIZATION_ACTIVATED:
      title = `<h3>Dear ${content.user_first_name} ${content.user_last_name},</h3>`;
      msg =
        '<p>Welcome to Global Forest Watch Pro. Your account has been approved. If this is your first time using the GFW Pro platform, you will receive a separate email with login instructions as well.</p>';
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
      msg =
        `${content.analysis_types} calculations are processing for <span style="font-weight: bold; color: rgba(0, 0, 0, 0.73);">${content.list_name}</span>. Analysis may take up to 24 hours. You will be notified by email when it's complete.` +
        '<p>Please contact the GFW Pro support team for help and additional information by filling out this <a href="https://gfwpro.zendesk.com/hc/en-us/requests/new?ticket_form_id=30920711977363" style="color: #404041; text-decoration: underline;">support form</a>. </p>';
      hasClosing = false;
      break;
    case config.platformVars.emailType.LIST_ANALYSIS_RERUN_SUCCESS:
      title = `Dear ${req.session.user_first_name} ${req.session.user_last_name},`;
      msg = `Diagnostics and List Views re-run process for the GFW Pro list ${content.list_name} has started and will be completed shortly. Please expect an email notification upon completion.`;
      break;
    case config.platformVars.emailType.LIST_ANALYSIS_ERROR:
      title = 'Unable to process';
      msg =
        `<p>Diagnostics and List View calculations failed for the GFW Pro list <span style="font-weight: bold; color: rgba(0, 0, 0, 0.73);">${content.list_name}</span>.</p>` +
        '<p>Try again and if the problem persists please contact the GFW Pro support team for help and additional information by filling out this <a href="https://gfwpro.zendesk.com/hc/en-us/requests/new?ticket_form_id=30920711977363" style="color: #404041; text-decoration: underline;">support form</a>. </p>';
      hasClosing = false;
      break;
    case config.platformVars.emailType.ANALYSIS_LIMIT_REACHED:
      title = `Usage Limit Exceeded - Analysis for ${content.list_name} Not Completed`;
      msg = `<p>You have reached your organization's GFW Pro analysis limit. Please contact the GFW Pro support team for help and additional information by filling out this <a href="https://gfwpro.zendesk.com/hc/en-us/requests/new?ticket_form_id=30920711977363" style="color: #404041; text-decoration: underline;">support form</a> to purchase additional usage. You can also refer to our <a href="https://www.globalforestwatch.org/help/guides/global-forest-watch-pro-price-sheet" style="color: #404041; text-decoration: underline;">price list</a> or <a href="https://www.globalforestwatch.org/help/gfw-pro/faq-subscription-fee-model-faq/" style="color: #404041; text-decoration: underline;">fee model FAQ page</a> for more information. Your list will appear saved in your account as a draft.</p>`;
      hasClosing = false;
      break;
    case config.platformVars.emailType.ORGANIZATION_APPROVED:
      title = `<h3>Dear ${content.user_first_name} ${content.user_last_name},</h3><p>Thank you for your GFW Pro account application.</p><p>We are pleased to inform you that your profile has been activated.</p><p>You will receive a separate email with your username and a temporary password.</p>`;
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

export const sendEmail = (req, sender, receivers, subject, content) => {
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
        const errObj = createErrorMessage(
          req,
          ERROR_CODES.failedToSendEmail,
          userMessage,
          sysMessage
        );
        reject(errObj);
      });
  });
  return promise;
};

export const sendEmail__ListSubmittedForAnalysis = async (req, list_name, analysis_types) => {
  const { user_email } = req.session;

  const enabledAnalyses = analysisTypesOptionsNewNames.filter(
    (analysis) => analysis_types[analysis.id]
  );
  const content = {
    list_name,
    analysis_types: enabledAnalyses.map((analysis) => analysis.label).join(', '),
  };
  const subject = `${enabledAnalyses
    .map((analysis) => analysis.shortLabel)
    .join(', ')} calculations are processing for the GFW Pro list ${list_name}`;
  const msg = createBodyContent(req, config.platformVars.emailType.LIST_ANALYSIS_STARTED, content);
  return sendEmail(req, config.AWSVars.ses.sender, [user_email], subject, msg);
};

export const sendErrorNotificationEmail = (req, type) => {
  const { user_email } = req.session;
  const { list } = req;

  const errorNotificationsConfig = {
    [config.platformVars.emailType.LIST_ANALYSIS_ERROR]: {
      subject: 'Error Submitting for Analysis',
      emailTemplate: config.platformVars.emailType.LIST_ANALYSIS_ERROR,
      level: 'error',
    },
    [config.platformVars.emailType.ANALYSIS_LIMIT_REACHED]: {
      subject: 'GFW Pro Usage Limit Exceeded - Analysis Not Completed',
      emailTemplate: config.platformVars.emailType.ANALYSIS_LIMIT_REACHED,
      level: 'limit',
    },
  };

  const errorType = errorNotificationsConfig[type] || errorNotificationsConfig.default;
  const { subject, emailTemplate, level } = errorType;

  const msg = createBodyContent(req, emailTemplate, list, level);

  return sendEmail(req, config.AWSVars.ses.sender, [user_email], subject, msg);
};
