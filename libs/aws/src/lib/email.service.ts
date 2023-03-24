import { Injectable } from '@nestjs/common';
import { SesService } from '@nextnm/nestjs-ses';
import { SesEmailOptions } from '@nextnm/nestjs-ses'


@Injectable()
export class EmailService {

  constructor(private sesService: SesService) {}


  createPage(bodyContent: {icon: string, title: string, body: string[], extra?: string}){
    return   `<!DOCTYPE html>
    <html lang='en' xmlns='http://www.w3.org/1999/xhtml' xmlns:o='urn:schemas-microsoft-com:office:office'>
      <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width,initial-scale=1'>
        <meta name='x-apple-disable-message-reformatting'>
        <title></title>
        <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
       <![endif]-->
       <link href='https://fonts.googleapis.com/css?family=Fira+Sans' rel='stylesheet' type='text/css'>
      </head>
      <body style='margin:0;padding:0;'>
        <table role='presentation' style='width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;'>
          <tr>
            <td align='center' style='padding:0;'>
              <table role='presentation' style='width:600px;border-collapse:collapse;border:0;border-spacing:0;text-align:left;'>
                <tr>
                  <td align='center' style='padding:10px 0 30px 0;background:#ffffff;'>
                    <img src='https://dpptfqp76xood.cloudfront.net/images/gfw-pro-email-banner.jpg' alt='' width='600' style='height:auto;display:block;'>
                  </td>
                </tr>
                <tr>
                  <td align='center' style='padding:30px 106px;background:#ffffff'>
                    <table role='presentation' style='width:100%;border-collapse:collapse;border:0;border-spacing:0;'>
                      <tr>
                        <td align='center' style='padding:0;'>
                          <img src='${bodyContent.icon}' alt='' style='height:auto;display:block;'>
                        </td>
                      </tr>
                      <tr>
                        <td align='center' style='padding:0;'>
                          <h1 style="font-size:18px;font-weight:500;margin:25px;letter-spacing:0.4px;font-family:'Fira Sans',Arial,sans-serif;color:rgba(0,0,0,0.73);">${bodyContent.title}</h1>
                        </td>
                      </tr>
                      <tr>
                        <td align='center' style='padding:0;'>
                        ${bodyContent.body.reduce((acc, paragraph) =>
                          acc.concat('',`<p style="font-size:12px;font-weight:400;margin:0;letter-spacing:0.25px;font-family:'Fira Sans',Arial,sans-serif;line-height:20px;color:rgba(0,0,0,0.54);">${paragraph}</p>`), '')
                        }
                        </td>
                      </tr>
                      ${bodyContent.extra ? `<tr><td align='center' style='padding:20px 0 0 0;'>${bodyContent.extra}</td></tr>` : ''}
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style='padding:30px 30px 10px 30px;background:#ffffff'>
                    <table role='presentation' style='width:100%;border-collapse:collapse;border:0;border-spacing:0;'>
                      <tr>
                        <td align='center' style='padding:0 82px 10px 82px;'>
                          <p style="font-size:12px;font-weight:400;margin:0;font-family:'Fira Sans',Arial,sans-serif;line-height:16px;color:rgba(0,0,0,0.5);">
                            Global Forest Watch Pro is a project of the World Resources Institute<br>
                            10 G Street NE Suite 800, Washington DC, 20002, USA<br>
                            +1 (202) 729-7600<br>
                            <a href='https://www.wri.org/' style='text-decoration: none; color: #97BD3D;'>www.wri.org</a>
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align='center' style='padding:0;height:1px;background:rgba(0,0,0,0.5);'></td>
                      </tr>
                      <tr>
                        <td align='center' style='padding:10px 0 0 0;'>
                          <p style="font-size:12px;font-weight:400;margin:0;font-family:'Fira Sans',Arial,sans-serif;line-height:16px;color:rgba(0,0,0,0.5);">Privacy Policy | Terms and Conditions</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;
  }

  generateEmailTemplate(type: string, filter: any): string {
    const { listName, location } = filter;

    const emailMessage = {
      start: {
        icon: 'https://dpptfqp76xood.cloudfront.net/images/pending_black_24dp.png',
        title: "Now it's up to us!",
        body: [
          `We’re preparing your data for download for <span style="color: rgba(0,0,0,0.73);">${listName}</span>. You will receive your download link and instructions via email within 24 hours.`
        ],
      },
      finish: {
        icon: 'https://dpptfqp76xood.cloudfront.net/images/check_circle_black_24dp.png',
        title: 'File generation completed successfully',
        body: [
          `File for <span style="color: rgba(0,0,0,0.73);">${listName}</span> is ready to be downloaded.`,
        ],
        extra: `<p style="margin:0;font-family:'Fira Sans',Arial,sans-serif;padding: 5px 0 0 0;">
                <!--[if mso]>
                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${location}" style="height:36px;v-text-anchor:middle;width:151px;" arcsize="278%" stroke="f" fillcolor="#97BD3D">
                  <w:anchorlock/>
                  <center>
                  <![endif]-->
                    <a href="${location}" style="background-color:#97BD3D;border-radius:100px;color:#ffffff;display:inline-block;font-family:'Fira Sans',Arial,sans-serif;font-size:13px;font-weight:bold;line-height:36px;text-align:center;text-decoration:none;width:151px;-webkit-text-size-adjust:none;">DOWNLOAD FILE</a>
                  <!--[if mso]>
                  </center>
                </v:roundrect>
                <![endif]-->
                </p>
                <p style="padding: 50px 0 0 0;font-size:10px;font-weight:400;margin:0;font-family:'Fira Sans',Arial,sans-serif;line-height:12px;color:rgba(0,0,0,0.54);">DOWNLOAD WITHIN 24 HOURS</p>`,
      },
      error: {
        icon: 'https://dpptfqp76xood.cloudfront.net/images/warning_black_24dp.png',
        title: 'We have a problem generating your file',
        body: ['The system had some problem to generate your file. Please try again.'],
      },
    };

    return this.createPage(emailMessage[type]);
  }

  async sendEmail(sender: string, receivers: Array<string>, subject: string, type: string, filter: any){
    const content = this.generateEmailTemplate(type, filter);

    const options: SesEmailOptions = {
      from: sender,
      to: receivers.join(','),
      subject: subject,
      html: content,
      replyTo:'',
    };

    await this.sesService.sendEmail(options);

  }
}
