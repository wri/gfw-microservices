import { Injectable } from '@nestjs/common';
import { SesService } from '@nextnm/nestjs-ses';
import { SesEmailOptions } from '@nextnm/nestjs-ses';

@Injectable()
export class EmailService {
  constructor(private sesService: SesService) {}

  createPage(bodyContent: string) {
    return `<!DOCTYPE html>
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
  }

  generateEmailTemplate(type: string, filter: any): string {
    const { listName, location, sourceEmail } = filter;

    const emailMessage = {
      start: `
      <div style="padding-top: 2rem; text-align: center;">
        <img src="https://dpptfqp76xood.cloudfront.net/images/pending_black_24dp.png"  alt="alt_text" border="0" align="center" class="g-img">
      </div>
      <div style="font-family: 'Fira Sans'; font-style: normal; font-weight: 600; font-size: 1.3rem; text-align: center; letter-spacing: 0.4px; color: rgba(0, 0, 0, 0.73);  padding: 35px;">
        Now it's up to us
      </div>
      <div style="font-family: 'Fira Sans'; font-style: normal; font-weight: 400; font-size: 1rem; line-height: 1.6rem; text-align: center; letter-spacing: 0.25px; color: rgba(0, 0, 0, 0.54);">
        We will review your request and you will be notified within 24 hours.
      </div>
      `,
      finish: `
      <div style="padding-top: 2rem; text-align: center;">
        <img src="https://dpptfqp76xood.cloudfront.net/images/check_circle_black_24dp.png"  alt="alt_text" border="0" align="center" class="g-img">
      </div>
      <div style="font-family: 'Fira Sans'; font-style: normal; font-weight: 600; font-size: 1.3rem; text-align: center; letter-spacing: 0.4px; color: rgba(0, 0, 0, 0.73);  padding: 35px;">
        File generation completed successfully
      </div>
      <div style="font-family: 'Fira Sans'; font-style: normal; font-weight: 400; font-size: 1rem; line-height: 1.6rem; text-align: center; letter-spacing: 0.25px; color: rgba(0, 0, 0, 0.54);">
        File are ready to be downloaded in the following link.
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
        We have a problem generating your file
      </div>
      <div style="font-family: 'Fira Sans'; font-style: normal; font-weight: 400; font-size: 1rem; line-height: 1.6rem; text-align: center; letter-spacing: 0.25px; color: rgba(0, 0, 0, 0.54);">
        The system had some problem to generate your file. Please try again.
      </div>
      `,
      connectInvite: `<div style="font-family: 'Fira Sans'; font-style: normal; font-weight: 400; font-size: 1rem; line-height: 1.6rem; text-align: center; letter-spacing: 0.25px; color: rgba(0, 0, 0, 0.54);">
      ${sourceEmail} has been invited you to create an new connection.
      </div>`,
    };

    return this.createPage(emailMessage[type]);
  }

  async sendEmail(
    sender: string,
    receivers: Array<string>,
    subject: string,
    type: string,
    filter: any
  ) {
    const content = this.generateEmailTemplate(type, filter);

    const options: SesEmailOptions = {
      from: sender,
      to: receivers.join(','),
      subject: subject,
      html: content,
      replyTo: '',
    };

    await this.sesService.sendEmail(options);
  }
}
