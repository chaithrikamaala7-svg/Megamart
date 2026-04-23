const nodemailer = require('nodemailer');

function isValidEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendOrderNotify(subject, text, customerEmail, html) {
  const adminTo = (process.env.ORDER_NOTIFY_EMAIL || '').trim();
  const user = (process.env.SMTP_EMAIL || '').trim();
  const pass = (process.env.SMTP_PASSWORD || '').trim();
  const blockedEmail = 'chaithrika.maala7@gmail.com';
  const onlyAllowed = 'chaithrikamaala@gmail.com';
  const customerTo = String(customerEmail || '').trim().toLowerCase();
  const recipients = [adminTo, customerTo]
    .map((v) => String(v || '').trim().toLowerCase())
    .filter((v) => isValidEmail(v))
    .filter((v) => v !== blockedEmail)
    .filter((v) => v === onlyAllowed)
    .filter((v, i, arr) => arr.indexOf(v) === i);

  if (!recipients.length || !user || !pass) 
  {
    return {
      ok: false,
      skipped: true,
      reason:
        'Missing recipient, SMTP_EMAIL, or SMTP_PASSWORD in server/.env.',
    };
  }

  try {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
    await transport.sendMail({
      from: `"Megamart" <${user}>`,
      to: recipients.join(','),
      subject,
      text,
      html: html || undefined,
    });
    return { ok: true };
  } 
  
  catch (err) {
    return {
      ok: false,
      skipped: false,
      reason: err.message || String(err),
    };
  }
}

module.exports = { sendOrderNotify };
