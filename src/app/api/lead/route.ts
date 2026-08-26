import { NextResponse } from 'next/server';

/**
 * Lead intake for the order modal, quiz, and lead forms. Validates name + phone
 * (email/message optional) and logs so local dev works without external
 * services. TODO(owner): forward to a Telegram bot / CRM (LEAD_INBOX).
 */
export async function POST(req: Request) {
  try {
    const data = (await req.json()) as Record<string, unknown>;
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    const phone = typeof data.phone === 'string' ? data.phone.trim() : '';
    const email = typeof data.email === 'string' ? data.email.trim() : '';
    const digits = phone.replace(/\D/g, '');

    // Accept either a valid phone or a valid email as a reachable contact.
    const hasContact = digits.length >= 10 || /.+@.+\..+/.test(email);
    if (!name || !hasContact) {
      return NextResponse.json({ ok: false, error: 'Invalid submission' }, { status: 400 });
    }

    console.log('[lead]', {
      name,
      phone,
      email,
      source: data.source ?? 'unknown',
      channel: data.channel ?? '',
      comment: data.comment ?? '',
      config: data.config ?? null,
      answers: data.answers ?? null,
      result: data.result ?? null,
      product: data.product ?? null,
      company: data.company ?? '',
      inbox: process.env.LEAD_INBOX_EMAIL ?? 'hello@smokeoclock.ua',
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
}
