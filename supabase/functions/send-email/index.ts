import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

serve(async (req) => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Get the request payload
    const payload: EmailPayload = await req.json();

    // Validate the payload
    if (!payload.to || !payload.subject || (!payload.html && !payload.text)) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize SMTP client
    const client = new SmtpClient();

    // Connect to SMTP server
    await client.connectTLS({
      hostname: Deno.env.get('SMTP_HOSTNAME') || '',
      port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
      username: Deno.env.get('SMTP_USERNAME') || '',
      password: Deno.env.get('SMTP_PASSWORD') || '',
    });

    // Send the email
    await client.send({
      from: Deno.env.get('SMTP_FROM') || '',
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
      JSON.stringify({
        success: true,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    // Log the error
    console.error('Failed to send email:', error);

    // Return error response
    return new Response(
      JSON.stringify({
        error: 'Failed to send email',
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});