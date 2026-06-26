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
  filter: DefaultEmailContentFilter | CustomFilter
): Content {
  const { listName, location } = filter as DefaultEmailContentFilter;

  const emailMessage = {
    start: {
      icon: 'https://dpptfqp76xood.cloudfront.net/images/pending_black_24dp.png',
      title: "Now it's up to us!",
      body: [
        `We’re preparing your data for download for <span style="color: rgb(69,69,69);">${listName}</span>. You will receive your download link and instructions via email within 24 hours.`,
        `<p>Please contact the GFW Pro support team for help and additional information by filling out this <a href="https://gfwpro.zendesk.com/hc/en-us/requests/new?ticket_form_id=30920711977363" style="color: #404041; text-decoration: underline;">support form</a>. </p>`,
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
    accountUsersUsageExportSuccess: {
      icon: 'https://dpptfqp76xood.cloudfront.net/images/check_circle_black_24dp.png',
      title: 'File generation completed successfully',
      body: [`Your account's usage breakdown by users is ready to be downloaded.`],
      cta: {
        href: `${location}`,
        body: 'DOWNLOAD FILE',
      },
    },
    proManagerUsersExportSuccess: {
      icon: 'https://dpptfqp76xood.cloudfront.net/images/check_circle_black_24dp.png',
      title: 'File generation completed successfully',
      body: [`Your GFW Pro users export is ready to be downloaded.`],
      cta: {
        href: `${location}`,
        body: 'DOWNLOAD FILE',
      },
    },
    listUploadError: {
      icon: 'https://dpptfqp76xood.cloudfront.net/images/error_black_24dp.png',
      title: 'Unable to process',
      body: [
        `<p>Diagnostic and List View calculations failed for the GFW Pro list <span style="font-weight: bold; color: rgba(0, 0, 0, 0.73);">${listName}</span>.</p>`,
        `<p>Please contact the GFW Pro support team for help and additional information by filling out this <a href="https://gfwpro.zendesk.com/hc/en-us/requests/new?ticket_form_id=30920711977363" style="color: #404041; text-decoration: underline;">support form</a>. </p>`,
      ],
    },
  };

  return emailMessage[type];
}
