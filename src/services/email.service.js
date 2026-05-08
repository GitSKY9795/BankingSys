const nodemailer = require("nodemailer");
const { getOTPHtml, getWelcomeHtml } = require('../utils/utils');
const { send } = require("node:process");
const mailConfig = {
  user: (process.env.GOOGLE_USER_EMAIL || '').trim(),
  clientId: (process.env.GOOGLE_CLIENT_ID || '').trim(),
  clientSecret: (process.env.GOOGLE_CLIENT_SECRET || '').trim(),
  refreshToken: (process.env.GOOGLE_REFRESH_TOKEN || '').trim(),
};

const requiredMailEnvVars = [
  ['GOOGLE_USER_EMAIL', mailConfig.user],
  ['GOOGLE_CLIENT_ID', mailConfig.clientId],
  ['GOOGLE_CLIENT_SECRET', mailConfig.clientSecret],
  ['GOOGLE_REFRESH_TOKEN', mailConfig.refreshToken],
];

for (const [key, value] of requiredMailEnvVars) {
  if (!value) {
    console.warn(`Missing mail environment variable: ${key}`);
  }
}

if (!mailConfig.refreshToken) {
  console.warn('GOOGLE_REFRESH_TOKEN is empty after trimming');
}

const transporter = nodemailer.createTransport({
  service: "gmail",
    auth: {
        type : 'OAuth2',
        user: mailConfig.user,
        clientId: mailConfig.clientId,
        clientSecret: mailConfig.clientSecret,
        refreshToken: mailConfig.refreshToken,
     
    }
});
transporter.verify((error,success)=>{
    if(error){
    console.error("Error connecting to email server:", error);
    }
    else{
        console.log("Email server is ready to send emails");
    }
})
const sendemail = async (to, subject, text, html) => {
try {
  const info = await transporter.sendMail({
    from: `"BACKEND LEDGER" <${mailConfig.user}>`, // sender address
    to, 
    subject, 
    text, 
    html, 
  });

  console.log("Message sent: %s", info.messageId);
  // Preview URL is only available when using an Ethereal test account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
} catch (err) {
  console.error("Error while sending mail:", err);
}};

async function sendWelcomeEmail(userEmail, name) {
  const subject = 'Welcome to Backend Ledger';
  const text = `Hello ${name},\n\nYour email has been verified successfully. Welcome to Backend Ledger!\n\nBest regards,\nThe Backend Ledger Team`;
  const html = getWelcomeHtml(name);
  await sendemail(userEmail, subject, text, html);
}

  async function sendVerificationEmail(userEmail, name, otp) {
    const subject = 'Verify your email address';
    const text = `Hello ${name},\n\nYour verification code is ${otp}. It expires in 10 minutes.`;
    const html = getOTPHtml(name, otp);

    await sendemail(userEmail, subject, text, html);
  }

async function sendTransactionEmail(
  userEmail,
  name,
  amount,
  fromAccount = "N/A",
  toAccount = "N/A",
  transactionId = "N/A"
) {
  const subject = "Transaction Successful";

  const text = `
Dear ${name},

Your transaction has been successfully completed.

Amount: ₹${amount}
From Account: ${fromAccount}
To Account: ${toAccount}
Transaction ID: ${transactionId}

Thank you for banking with us.

SecurePay Services
`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Transaction Successful</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">

    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" 
            style="background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.1);">

            <!-- Header -->
            <tr>
              <td align="center" 
                style="background:#1e3a8a; color:#ffffff; padding:25px; font-size:28px; font-weight:bold;">
                SecurePay Services
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px; color:#333333;">

                <h2 style="margin-top:0; color:#1e3a8a;">
                  Transaction Successful
                </h2>

                <p style="font-size:16px;">
                  Dear <strong>${name}</strong>,
                </p>

                <p style="font-size:16px; line-height:1.6;">
                  We are pleased to inform you that your transaction has been 
                  processed successfully.
                </p>

                <!-- Transaction Details -->
                <table width="100%" cellpadding="10" cellspacing="0"
                  style="margin:25px 0; border:1px solid #e5e7eb; border-collapse:collapse;">

                  <tr style="background:#f9fafb;">
                    <td><strong>Amount</strong></td>
                    <td>₹${amount}</td>
                  </tr>

                  <tr>
                    <td><strong>From Account</strong></td>
                    <td>${fromAccount}</td>
                  </tr>

                  <tr style="background:#f9fafb;">
                    <td><strong>To Account</strong></td>
                    <td>${toAccount}</td>
                  </tr>

                  <tr>
                    <td><strong>Transaction ID</strong></td>
                    <td>${transactionId}</td>
                  </tr>

                  <tr style="background:#f9fafb;">
                    <td><strong>Status</strong></td>
                    <td style="color:green; font-weight:bold;">
                      Successful
                    </td>
                  </tr>

                </table>

                <p style="font-size:15px; line-height:1.6;">
                  If you did not authorize this transaction, please contact our 
                  support team immediately.
                </p>

                <p style="margin-top:30px; font-size:16px;">
                  Thank you for choosing us.
                </p>

                <p style="font-size:16px; font-weight:bold;">
                  SecurePay Services
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center"
                style="background:#f3f4f6; color:#6b7280; padding:20px; font-size:13px;">
                © 2026 SecurePay Services. All rights reserved.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
  await sendemail(userEmail, subject, text, html);

  // send email using nodemailer
}
async function transActionfailureMail(
  userEmail,
  name,
  amount,
  fromAccount,
  toAccount,
  transactionId
) {

  const subject = "Transaction Failed";

  const text = `
Dear ${name},

We regret to inform you that your recent transaction could not be completed.

Transaction Details:
--------------------------------------------------
Amount Attempted : ₹${amount}
From Account     : ${fromAccount}
To Account       : ${toAccount}
Transaction ID   : ${transactionId}
Status           : Failed
--------------------------------------------------

Possible reasons may include:
- Insufficient balance
- Network/server issue
- Incorrect account details
- Bank service interruption

Please try again later or contact support if the issue persists.

Thank you for banking with us.

SecurePay Services
`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Transaction Failed</title>
  </head>

  <body
    style="
      margin:0;
      padding:0;
      background-color:#f4f4f4;
      font-family:Arial, sans-serif;
    "
  >

    <table
      align="center"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="padding:40px 0;"
    >
      <tr>
        <td align="center">

          <table
            width="600"
            cellpadding="0"
            cellspacing="0"
            style="
              background:#ffffff;
              border-radius:10px;
              overflow:hidden;
              box-shadow:0 2px 10px rgba(0,0,0,0.1);
            "
          >

            <!-- Header -->
            <tr>
              <td
                align="center"
                style="
                  background:#dc2626;
                  color:#ffffff;
                  padding:25px;
                  font-size:28px;
                  font-weight:bold;
                "
              >
                SecurePay Services
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px; color:#333333;">

                <h2 style="margin-top:0; color:#dc2626;">
                  Transaction Failed
                </h2>

                <p style="font-size:16px;">
                  Dear <strong>${name}</strong>,
                </p>

                <p style="font-size:16px; line-height:1.6;">
                  We regret to inform you that your transaction could not be
                  completed successfully.
                </p>

                <!-- Transaction Details -->
                <table
                  width="100%"
                  cellpadding="10"
                  cellspacing="0"
                  style="
                    margin:25px 0;
                    border:1px solid #e5e7eb;
                    border-collapse:collapse;
                  "
                >

                  <tr style="background:#f9fafb;">
                    <td><strong>Amount</strong></td>
                    <td>₹${amount}</td>
                  </tr>

                  <tr>
                    <td><strong>From Account</strong></td>
                    <td>${fromAccount}</td>
                  </tr>

                  <tr style="background:#f9fafb;">
                    <td><strong>To Account</strong></td>
                    <td>${toAccount}</td>
                  </tr>

                  <tr>
                    <td><strong>Transaction ID</strong></td>
                    <td>${transactionId}</td>
                  </tr>

                  <tr style="background:#f9fafb;">
                    <td><strong>Status</strong></td>
                    <td style="color:#dc2626; font-weight:bold;">
                      Failed
                    </td>
                  </tr>

                </table>

                <!-- Reasons -->
                <div
                  style="
                    background:#fef2f2;
                    border-left:4px solid #dc2626;
                    padding:15px;
                    margin-top:20px;
                    border-radius:5px;
                  "
                >
                  <p style="margin:0; font-size:15px;">
                    Possible reasons:
                  </p>

                  <ul style="margin-top:10px; line-height:1.8;">
                    <li>Insufficient balance</li>
                    <li>Incorrect account details</li>
                    <li>Temporary bank server issue</li>
                    <li>Network interruption</li>
                  </ul>
                </div>

                <p style="font-size:15px; line-height:1.6; margin-top:25px;">
                  Please try again later or contact our support team if the
                  issue persists.
                </p>

                <p style="margin-top:30px; font-size:16px;">
                  Thank you for choosing us.
                </p>

                <p style="font-size:16px; font-weight:bold;">
                  SecurePay Services
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                align="center"
                style="
                  background:#f3f4f6;
                  color:#6b7280;
                  padding:20px;
                  font-size:13px;
                "
              >
                © 2026 SecurePay Services. All rights reserved.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
await sendemail(userEmail , subject , text , html);
  // send mail using nodemailer
}



  module.exports = { sendWelcomeEmail, sendVerificationEmail , sendTransactionEmail , transActionfailureMail};

