const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey', // This is literally the string 'apikey'
    pass: process.env.SENDGRID_API_KEY, // Your SendGrid API key
  },
});

function isValidEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendOrderNotify(subject, text, customerEmail, html) {
  const adminTo = (process.env.ORDER_NOTIFY_EMAIL || '').trim();
  const user = (process.env.SMTP_EMAIL || '').trim();
  const pass = (process.env.SMTP_PASSWORD || '').trim();
  // const blockedEmail = 'chaithrika.maala7@gmail.com';
  const customerTo = String(customerEmail || '').trim().toLowerCase();
  const recipients = [adminTo, customerTo]
    .map((v) => String(v || '').trim().toLowerCase())
    .filter((v) => isValidEmail(v))
    // .filter((v) => v !== blockedEmail)
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

async function sendOtpMail(recipientEmail, otpCode) {
    console.log('Attempting to send OTP email:', recipientEmail, otpCode);
  const to = String(recipientEmail || '').trim().toLowerCase();
  const user = (process.env.SMTP_EMAIL || '').trim();
  const pass = (process.env.SMTP_PASSWORD || '').trim();

  if (!isValidEmail(to)) {
    console.error('Invalid recipient email:', to);
    return { ok: false, skipped: true, reason: 'Invalid recipient email' };
  }
  if (!user || !pass) {
    console.error('Missing SMTP_EMAIL or SMTP_PASSWORD:', user, pass);
    return {
      ok: false,
      skipped: true,
      reason: 'Missing SMTP_EMAIL or SMTP_PASSWORD in server/.env.',
    };
  }

  try {
    await transport.sendMail({
      from: `"Megamart" <${user}>`,
      to,
      subject: 'Megamart Login OTP',
      text: `Your OTP for login is ${otpCode}. It is valid for 5 minutes.`,
      html: `<p>Your OTP for login is <b>${otpCode}</b>.</p><p>It is valid for 5 minutes.</p>`,
    });
    console.log('OTP email sent successfully to:', to);
    return { ok: true };
  } catch (err) {
    console.error('Error sending OTP email:', err);
    return {
      ok: false,
      skipped: false,
      reason: err.message || String(err),
    };
  }
}

module.exports = { sendOrderNotify, sendOtpMail };
