export function createPage(bodyContent: {
  icon: string;
  title: string;
  body: string[];
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
                          <img src='${
                            bodyContent.icon
                          }' alt='' style='height:auto;display:block;'>
                        </td>
                      </tr>
                      <tr>
                        <td align='center' style='padding:0;'>
                          <h1 style="font-size:18px;font-weight:500;margin:25px;letter-spacing:0.4px;font-family:'Fira Sans',Arial,sans-serif;color:rgba(0,0,0,0.73);">${
                            bodyContent.title
                          }</h1>
                        </td>
                      </tr>
                      <tr>
                        <td align='center' style='padding:0;'>
                        ${bodyContent.body.reduce(
                          (acc, paragraph) =>
                            acc.concat(
                              '',
                              `<p style="font-size:12px;font-weight:400;margin:0;letter-spacing:0.25px;font-family:'Fira Sans',Arial,sans-serif;line-height:20px;color:rgba(0,0,0,0.54);">${paragraph}</p>`
                            ),
                          ''
                        )}
                        </td>
                      </tr>
                      ${
                        bodyContent.extra
                          ? `<tr><td align='center' style='padding:20px 0 0 0;'>${bodyContent.extra}</td></tr>`
                          : ''
                      }
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
