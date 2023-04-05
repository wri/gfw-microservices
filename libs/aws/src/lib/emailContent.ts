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

export function createEmailContent(type: string, filter: any, context: { sender: string }): Content {
  const { listName, location } = filter;

  const emailMessage = {
    start: {
      icon: 'https://dpptfqp76xood.cloudfront.net/images/pending_black_24dp.png',
      title: "Now it's up to us!",
      body: [
        `We’re preparing your data for download for <span style="color: rgb(69,69,69);">${listName}</span>. You will receive your download link and instructions via email within 24 hours.`,
      ],
    },
    finish: {
      icon: 'https://dpptfqp76xood.cloudfront.net/images/check_circle_black_24dp.png',
      title: 'File generation completed successfully',
      body: [
        `File for <span style="color: rgb(69,69,69);">${listName}</span> is ready to be downloaded.`,
      ],
      cta: {
        href: `${location}`,
        body: 'DOWNLOAD FILE',
      },
      extra: 'DOWNLOAD WITHIN 24 HOURS',
    },
    error: {
      icon: 'https://dpptfqp76xood.cloudfront.net/images/warning_black_24dp.png',
      title: 'We have a problem generating your file',
      body: [
        'The system had some problem to generate your file. Please try again.',
      ],
    },
    connectInvite: {
      icon: 'https://dpptfqp76xood.cloudfront.net/images/pending_black_24dp.png',
      title: 'B2B connection invitation',
      body: [
        `${context.sender} has invited you to create an new connection.`,
      ]
    },
  };

  return emailMessage[type];
}
