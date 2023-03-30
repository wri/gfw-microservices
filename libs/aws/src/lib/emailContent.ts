type PrimaryContent = {
  icon: string;
  title: string;
  body: Array<string>;
};

type StartContent = PrimaryContent;

type FinishContent = PrimaryContent & {
  extra: string;
};

type ErrorContent = PrimaryContent;

type Content = StartContent | FinishContent | ErrorContent;

export function createEmailContent(type: string, filter: any): Content {
  const { listName, location } = filter;

  const emailMessage = {
    start: {
      icon: 'https://dpptfqp76xood.cloudfront.net/images/pending_black_24dp.png',
      title: "Now it's up to us!",
      body: [
        `We’re preparing your data for download for <span style="color: rgba(0,0,0,0.73);">${listName}</span>. You will receive your download link and instructions via email within 24 hours.`,
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
      body: [
        'The system had some problem to generate your file. Please try again.',
      ],
    },
  };

  return emailMessage[type];
}
