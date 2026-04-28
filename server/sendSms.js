// sendSms.js
// Utility to send OTP SMS using Fast2SMS (or similar SMS gateway)
const axios = require('axios');

async function sendOtpSms(mobile, otp, purpose = "signup") {
  // Replace with your SMS gateway API details
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) return { ok: false, reason: 'Missing FAST2SMS_API_KEY in .env' };
  const normalizedPurpose = String(purpose || "signup").toLowerCase();
  const message =
    normalizedPurpose === "login"
      ? `MegaMart: Your OTP for login is ${otp}. Do not share this code with anyone.`
      : `MegaMart: Your OTP for signup is ${otp}. Do not share this code with anyone.`;
  try {
    const resp = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      route: 'otp',
      variables_values: otp,
      numbers: mobile,
      message: message,
      sender_id: 'MEGAMT',
      language: 'english',
      flash: 0,
    }, {
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      }
    });
    if (resp.data && resp.data.return) {
      return { ok: true };
    } else {
      return { ok: false, reason: resp.data.message || 'SMS failed' };
    }
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

module.exports = { sendOtpSms };