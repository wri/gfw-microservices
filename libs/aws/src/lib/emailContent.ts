type Content = {
  icon: string;
  title: string;
  body: Array<string>;
  cta?: {
    href: string;
    body: string;
  };
  extra?: string;
};

interface DefaultEmailContentFilter {
  listName?: string;
  location?: string;
}
export function createEmailContent<CustomFilter>(
  type: string,
  filter: DefaultEmailContentFilter | CustomFilter,
  context: { sender: string }
): Content {
  const { listName, location } = filter as DefaultEmailContentFilter;
  const { sender } = context;

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
      title: 'We had a problem generating your file',
      body: ['The system had problems generating your file. Please try again.'],
    },
    connectInvite: {
      icon: 'https://dpptfqp76xood.cloudfront.net/images/pending_black_24dp.png',
      title: 'B2B connection invitation',
      body: [`${sender} has invited you to create an new connection.`],
    },
    accountUsersUsageExportSuccess: {
      icon: 'https://dpptfqp76xood.cloudfront.net/images/check_circle_black_24dp.png',
      title: 'File generation completed successfully',
      body: [`Your account's usage breakdown by users is ready to be downloaded.`],
      cta: {
        href: `${location}`,
        body: 'DOWNLOAD FILE',
      },
    },
  };

  return emailMessage[type];
}
