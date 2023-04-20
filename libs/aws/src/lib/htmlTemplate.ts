export function createPage(bodyContent: {
  icon: string;
  title: string;
  body: string[];
  cta?: { href: string; body: string };
  extra?: string;
}) {
  return `<!DOCTYPE html>
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
       <!--[if !mso]><!-- -->
       <link href='https://fonts.googleapis.com/css?family=Fira+Sans' rel='stylesheet' type='text/css'>
       <!--<![endif]-->
      </head>
      <body style='margin:0;padding:0;'>
        <table role='presentation' style='width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;'>
          <tr>
            <td align='center' style='padding:0;'>
              <table role='presentation' style='width:600px;border-collapse:collapse;border:0;border-spacing:0;text-align:left;'>
                <tr>
                  <td align='center' style='padding:0;background:#ffffff;'>
                    <p style="font-style:normal;font-weight:400;font-size:12px;line-height:20px;mso-line-height-rule:exactly;letter-spacing:0.25px;font-family:'Fira Sans',Arial,sans-serif;margin:0;">&nbsp;</p>
                  </td>
                </tr>
                <tr>
                  <td align='center' style='padding:10px 0 30px 0;background:#ffffff;'>
                    <img src='https://dpptfqp76xood.cloudfront.net/images/gfw-pro-email-banner.jpg' alt='' width='600' style='height:auto;display:block;'>
                  </td>
                </tr>
                <tr>
                  <td align='center' style='padding:30px 71px;background:#ffffff'>
                    <table role='presentation' style='width:100%;border-collapse:collapse;border:0;border-spacing:0;'>
                      <tr>
                        <td align='center' style='padding:0;'>
                          <img src='${
                            bodyContent.icon
                          }' alt='' style='width:105px;height:auto;display:block;'>
                        </td>
                      </tr>
                      <tr>
                        <td align='center' style='padding:0;'>
                          <p style="font-style:normal;font-weight:500;font-size:18px;line-height:15px;mso-line-height-rule:exactly;letter-spacing:0.4px;font-family:'Fira Sans',Arial,sans-serif;color:rgb(69,69,69);margin:25px;">${
                            bodyContent.title
                          }</p>
                        </td>
                      </tr>
                      <tr>
                        <td align='center' style='padding:0;'>
                        ${bodyContent.body.reduce(
                          (acc, paragraph) =>
                            acc.concat(
                              '',
                              `<p style="font-style:normal;font-weight:400;font-size:12px;line-height:20px;mso-line-height-rule:exactly;letter-spacing:0.25px;font-family:'Fira Sans',Arial,sans-serif;color:rgb(117,117,117);margin:0;">${paragraph}</p>`
                            ),
                          ''
                        )}
                        </td>
                      </tr>
                      ${
                        bodyContent.cta
                          ? `
                      <tr>
                        <td align='center' style='padding:20px 0 0 0;'>
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${bodyContent.cta.href}" style="height:36px;v-text-anchor:middle;width:151px;" arcsize="278%" stroke="f" fillcolor="#97BD3D">
                            <w:anchorlock/>
                            <center>
                            <![endif]-->
                              <a href="${bodyContent.cta.href}" style="background-color:#97BD3D;border-radius:100px;color:#ffffff;display:inline-block;font-family:'Fira Sans',Arial,sans-serif;font-size:13px;font-weight:bold;line-height:36px;text-align:center;text-decoration:none;width:151px;-webkit-text-size-adjust:none;letter-spacing:1px;">${bodyContent.cta.body}</a>
                            <!--[if mso]>
                            </center>
                          </v:roundrect>
                          <![endif]-->
                        </td>
                      </tr>`
                          : ''
                      }
                    </table>
                  </td>
                </tr>
                ${
                  bodyContent.extra
                    ? `
                <tr>
                  <td align='center' style="padding:0 71px; background:#ffffff">
                    <table role='presentation' style='width:100%;border-collapse:collapse;border:0;border-spacing:0;'>
                      <tr>
                        <td align='center' style='padding:0;'>
                          <p style="padding:0 0 25px 0;font-size:12px;font-weight:400;margin:0;font-family:'Fira Sans',Arial,sans-serif;line-height:20px;color:rgb(117,117,117);">
                            ${bodyContent.extra}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`
                    : ''
                }
                <tr>
                  <td style='padding:30px 30px 10px 30px;background:#ffffff'>
                    <table role='presentation' style='width:100%;border-collapse:collapse;border:0;border-spacing:0;'>
                      <tr>
                        <td align='center' style='padding:0 82px 10px 82px;'>
                          <p style="font-style:normal;font-weight:400;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-family:'Fira Sans',Arial,sans-serif;color:rgb(128,128,128);margin:0;">
                            Global Forest Watch Pro is a project of the World Resources Institute<br>
                            10 G Street NE Suite 800, Washington DC, 20002, USA<br>
                            +1 (202) 729-7600<br>
                            <a href='https://www.wri.org/' style='text-decoration: none; color: #97BD3D;'>www.wri.org</a>
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align='center' style='padding:0;height:1px;border-top:1px solid rgb(128,128,128);'></td>
                      </tr>
                      <tr>
                        <td align='center' style='padding:10px 0 0 0;'>
                          <p style="font-style:normal;font-weight:400;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-family:'Fira Sans',Arial,sans-serif;color:rgb(128,128,128);margin:0;">Privacy Policy | Terms and Conditions</p>
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
