const Mail = use('Mail');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendEmail(recipient, subject, template, data, options = {}) {
  const from = options.from || 'Open Letter <support@openletter.earth>';
  const maxAttempts = options.maxAttempts || 10;

  if (!isValidEmail(recipient)) {
    console.error('>>> invalid email', recipient);
    return;
  }

  let attempt = 0;

  const makeAttempt = async () => {
    try {
      if (attempt > maxAttempts) {
        console.error('>>> too many attempts to send email to ', recipient);
        return;
      }
      await Mail.send(template, data, (message) => {
        message.to(recipient).from(from).subject(subject);
      });
      console.log('>>> email sent');
    } catch (e) {
      console.error('error', JSON.stringify(e, null, '  '));
      attempt++;
      console.log('>>> new attempt in 10mn');
      setTimeout(makeAttempt, 1000 * 60 * 10);
    }
  };

  return await makeAttempt();
}

module.exports = {
  sendEmail,
};
