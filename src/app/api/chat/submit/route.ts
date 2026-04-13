import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function sendEmail(
  name: string,
  email: string,
  message: string
) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured, skipping email');
    return { success: false, reason: 'API key not configured' };
  }

  try {
    // Dynamically import Resend to avoid requiring it if not needed
    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);

    const response = await resend.emails.send({
      from: 'Shiftera Support <onboarding@resend.dev>',
      to: 'napoles.tomas@gmail.com',
      replyTo: email,
      subject: `[Shiftera Support] Message from ${name}`,
      html: `
        <h2>New Support Message</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <hr />
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    return { success: true, messageId: response.data?.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, language = 'en' } = await request.json();

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Name is too long' },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Message is too long' },
        { status: 400 }
      );
    }

    // Email validation (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Store in Supabase
    const { error: dbError } = await supabase
      .from('support_messages')
      .insert({
        name,
        email,
        message,
        language,
        status: 'open',
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    // Try to send email (best effort - don't fail if email fails)
    const emailResult = await sendEmail(name, email, message);

    return NextResponse.json({
      success: true,
      message: 'Your support request has been received. We will get back to you shortly.',
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error('Chat submit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
