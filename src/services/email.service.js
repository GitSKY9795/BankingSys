const nodemailer = require("nodemailer");
const { getOTPHtml } = require('../utils/utils');
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

async function sendRegisterEmail(userEmail,name){
    const subject = 'Welcome to the team Backend Ledger'
    const text = `Hello ${name},\n\n Thank you for registering at backend Ledger.
    We are excited to have you on board ! \n\n Best regards, \n The Backend Ledger Team`;
    const html  = `
    <p>Hello ${name},</p>
    <p>Thank you for registering at Backend Ledger. We are excited to have you on board!</p>
    <p>Best regards,</p>
    <p>The Backend Ledger Team</p>
    `
    await sendemail(userEmail,subject,text,html);
}

  async function sendVerificationEmail(userEmail, name, otp) {
    const subject = 'Verify your email address';
    const text = `Hello ${name},\n\nYour verification code is ${otp}. It expires in 10 minutes.`;
    const html = getOTPHtml(otp);

    await sendemail(userEmail, subject, text, html);
  }

  module.exports = { sendRegisterEmail, sendVerificationEmail };

