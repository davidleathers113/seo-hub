interface InvitationEmailProps {
  workspaceName: string;
  inviterName: string;
  inviterEmail: string;
  token: string;
}

export const html = ({ workspaceName, inviterName, inviterEmail, token }: InvitationEmailProps) => {
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/workspace/invite?token=${encodeURIComponent(token)}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Workspace Invitation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 20px;
      font-size: 0.875rem;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>You've Been Invited!</h1>
    <p>Hello,</p>
    <p>
      <strong>${inviterName || inviterEmail}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace.
    </p>
    <p>Click the button below to accept the invitation and join the workspace:</p>

    <a href="${link}" class="button">Accept Invitation</a>

    <p>Or copy and paste this URL into your browser:</p>
    <p>${link}</p>

    <div class="footer">
      <p>This invitation will expire in 7 days.</p>
      <p>If you didn't expect this invitation, you can safely ignore this email.</p>
      <p>If you have any questions, please contact the workspace admin.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const text = ({ workspaceName, inviterName, inviterEmail, token }: InvitationEmailProps) => {
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/workspace/invite?token=${encodeURIComponent(token)}`;

  return `
You've Been Invited!

Hello,

${inviterName || inviterEmail} has invited you to join the ${workspaceName} workspace.

Click the link below to accept the invitation and join the workspace:
${link}

This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.
If you have any questions, please contact the workspace admin.
  `;
};