/**
 * Notify Frontend Error
 * @param {String} error
 * @returns Promise
 */
export default function notifyErrorToSlack(error) {
  const message = `\`\`\` ${error.stack} \`\`\``;

  return fetch('/', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      message,
    },
  }).then((res) => res.json());
}
