import "dotenv/config";
import sgMail from "@sendgrid/mail";

export async function sendFromSendGrid(email, token) {
  const sendGridKey = process.env.SENGRID_API_KEY;
  const base = process.env.BASE_URL;
  const verificationLink = `${base}/api/users/verify/${token}`;

  sgMail.setApiKey(sendGridKey);

  const msg = {
    to: email,
    from: "alexandru.marian1998@gmail.com",
    subject: "Verify your email",
    text: `Verify your email address and start adding contacts in your new contact management application.
      Choose one of the two email verification options:
      1. Click the "verify email" button.
      2. Copy the verification link into your browser's address bar.
      ${verificationLink}`,
    html: `Verify your email address and start adding contacts in your new contact management application.<br/>
      Choose one of the two email verification options:<br/>
      1. Click the <strong>"verify email"</strong> button.<br/>
      <a href="${verificationLink}">Verify email</a><br/>
      2. Copy the <strong>verification link</strong> into your browser's address bar.<br/>
      ${verificationLink}`,
  };

  try {
    await sgMail.send(msg);
    console.log(msg);
    console.log(`Email has been sent to ${email}`);
  } catch (error) {
    if (error?.response) {
      console.error(error.response.body);
    } else {
      console.error(error);
    }
  }
}
