const crypto = require('node:crypto');

function generateOTP(length = 6) {
    const max = 10 ** length;
    return crypto.randomInt(0, max).toString().padStart(length, '0');
}

function getOTPHtml(name, otp){
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your email</title>
</head>
<body style="margin:0;font-family:Arial,sans-serif;background:#f6f8fc;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px rgba(15,23,42,0.12);">
        <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:28px 32px;color:#fff;">
            <p style="margin:0;font-size:14px;letter-spacing:1px;text-transform:uppercase;opacity:0.8;">Backend Ledger</p>
            <h2 style="margin:10px 0 0;font-size:28px;">Verify your email address</h2>
        </div>
        <div style="padding:32px;">
            <p style="margin:0 0 16px;font-size:16px;color:#334155;">Hello ${name},</p>
            <p style="margin:0 0 24px;font-size:16px;color:#334155;line-height:1.6;">Use the code below to finish creating your account. It expires in 10 minutes.</p>
            <div style="display:inline-block;padding:16px 28px;border-radius:12px;background:#eef2ff;color:#1d4ed8;font-size:30px;font-weight:700;letter-spacing:4px;">
                ${otp}
            </div>
            <p style="margin:24px 0 0;font-size:14px;color:#64748b;line-height:1.6;">If you did not request this verification, you can ignore this message.</p>
        </div>
    </div>
</body>
</html>`;
}

function getWelcomeHtml(name) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Backend Ledger</title>
</head>
<body style="margin:0;font-family:Arial,sans-serif;background:#f6f8fc;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px rgba(15,23,42,0.12);">
        <div style="background:linear-gradient(135deg,#14532d,#16a34a);padding:28px 32px;color:#fff;">
            <p style="margin:0;font-size:14px;letter-spacing:1px;text-transform:uppercase;opacity:0.8;">Backend Ledger</p>
            <h2 style="margin:10px 0 0;font-size:28px;">Welcome aboard</h2>
        </div>
        <div style="padding:32px;">
            <p style="margin:0 0 16px;font-size:16px;color:#334155;">Hello ${name},</p>
            <p style="margin:0 0 24px;font-size:16px;color:#334155;line-height:1.6;">Your email has been verified successfully. Your account is ready to use, and we are glad to have you with Backend Ledger.TEST KR RHA SERIOUS NA LENA 😁😁☠️☠️-SUMEET</p>
            <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">You can now sign in and continue with your dashboard.</p>
        </div>
    </div>
</body>
</html>`;
}

module.exports = { generateOTP, getOTPHtml, getWelcomeHtml };

function getPasswordResetHtml(name, resetLink) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password reset</title>
</head>
<body style="margin:0;font-family:Arial,sans-serif;background:#f6f8fc;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px rgba(15,23,42,0.12);">
        <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:28px 32px;color:#fff;">
            <p style="margin:0;font-size:14px;letter-spacing:1px;text-transform:uppercase;opacity:0.8;">Backend Ledger</p>
            <h2 style="margin:10px 0 0;font-size:28px;">Reset your password</h2>
        </div>
        <div style="padding:32px;">
            <p style="margin:0 0 16px;font-size:16px;color:#334155;">Hello ${name},</p>
            <p style="margin:0 0 24px;font-size:16px;color:#334155;line-height:1.6;">Click the button below to reset your password. This link is valid for one hour.</p>
            <div style="text-align:center;margin:24px 0;">
                <a href="${resetLink}" style="display:inline-block;padding:12px 22px;border-radius:8px;background:#1e3a8a;color:#fff;text-decoration:none;font-weight:600;">Reset password</a>
            </div>
            <p style="margin:24px 0 0;font-size:14px;color:#64748b;line-height:1.6;">If you did not request this, please ignore this message.</p>
        </div>
    </div>
</body>
</html>`;
}

function getPasswordResetOtpHtml(name, otp) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password reset code</title>
</head>
<body style="margin:0;font-family:Arial,sans-serif;background:#f6f8fc;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px rgba(15,23,42,0.12);">
        <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:28px 32px;color:#fff;">
            <p style="margin:0;font-size:14px;letter-spacing:1px;text-transform:uppercase;opacity:0.8;">Backend Ledger</p>
            <h2 style="margin:10px 0 0;font-size:28px;">Your password reset code</h2>
        </div>
        <div style="padding:32px;">
            <p style="margin:0 0 16px;font-size:16px;color:#334155;">Hello ${name},</p>
            <p style="margin:0 0 24px;font-size:16px;color:#334155;line-height:1.6;">Use the code below to reset your password. It expires in one hour.</p>
            <div style="display:inline-block;padding:16px 28px;border-radius:12px;background:#eef2ff;color:#1d4ed8;font-size:30px;font-weight:700;letter-spacing:4px;">
                ${otp}
            </div>
            <p style="margin:24px 0 0;font-size:14px;color:#64748b;line-height:1.6;">If you did not request this, please ignore this message.</p>
        </div>
    </div>
</body>
</html>`;
}

module.exports = { generateOTP, getOTPHtml, getWelcomeHtml, getPasswordResetHtml, getPasswordResetOtpHtml };