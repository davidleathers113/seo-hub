import { serve, SmtpClient } from './deps.ts';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

serve(async (req) => {
  // CORS headers for preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    // Get and validate the request payload
    const payload: EmailPayload = await req.json();
    if (!payload.to || !payload.subject || (!payload.html && !payload.text)) {
      throw new Error('Missing required fields');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.to)) {
      throw new Error('Invalid email format');
    }

    // Initialize SMTP client with environment variables
    const client = new SmtpClient();
    const hostname = Deno.env.get('SMTP_HOSTNAME');
    const port = parseInt(Deno.env.get('SMTP_PORT') || '587');
    const username = Deno.env.get('SMTP_USERNAME');
    const password = Deno.env.get('SMTP_PASSWORD');
    const from = Deno.env.get('SMTP_FROM');

    // Validate SMTP configuration
    if (!hostname || !username || !password || !from) {
      throw new Error('Missing SMTP configuration');
    }

    // Connect to SMTP server
    await client.connectTLS({
      hostname,
      port,
      username,
      password,
    });

    // Send the email
    await client.send({
      from,
      to: payload.to,
      subject: payload.subject,
      content: payload.html,
      html: payload.html,
      textContent: payload.text,
    });

    // Close the connection
    await client.close();

    // Return success response
    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Email sending error:', error);

    // Return appropriate error response
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: error instanceof Error && error.message.includes('Missing') ? 400 : 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});