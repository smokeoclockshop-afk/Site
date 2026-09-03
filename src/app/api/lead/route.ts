import { NextResponse } from 'next/server';

/**
 * Lead intake for the order modal, quiz, contact and B2B forms. Validates
 * name + phone (email optional), then forwards the lead to the workshop's
 * Telegram group as a tidy card: where it came from (form, page, device),
 * contact details, the product / options / quiz answers, the comment.
 *
 * TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID come from the environment (.env.local
 * locally, Netlify environment variables in production). In development a
 * missing configuration only logs; in production it fails loudly so the
 * visitor sees the error state with messenger links instead of a fake "sent".
 */

/** Human labels for the `source` tags the forms send. */
const SOURCE_LABELS: Record<string, string> = {
  header: 'кнопка «Замовити» у шапці',
  'mobile-menu': 'кнопка «Замовити» у мобільному меню',
  'sticky-home': 'нижня плашка «Замовити»',
  'ladder-custom': 'лінійка виробів → «свій проєкт»',
  'catalog-custom': 'каталог → «свій проєкт»',
  queue: 'блок «черга на виготовлення»',
  dishes: 'блок «страви»',
  quiz: 'квіз «який смокер потрібен»',
  'quiz-custom': 'квіз → індивідуальний проєкт',
  contact: 'форма на сторінці «Контакти»',
  b2b: 'форма на сторінці «Для бізнесу»',
  smoker: 'сторінка «Смокери» → «Замовити»',
  'smoker-final': 'сторінка «Смокери» → фінальна кнопка',
  catalog: 'каталог → картка виробу',
};

const sourceLabel = (source: string) => SOURCE_LABELS[source] ?? SOURCE_LABELS[source.split(':')[0]] ?? source;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '').map((x) => x.trim().slice(0, 120)) : [];

interface Lead {
  name: string;
  phone: string;
  email: string;
  source: string;
  channel: string;
  comment: string;
  company: string;
  budget: string;
  product: string;
  result: string;
  config: string[];
  answers: string[];
  /** Page path the form was submitted from (from the Referer header). */
  page: string;
  device: string;
}

const RULE = '––––––––––––––––––––';

function formatMessage(lead: Lead): string {
  const b2b = lead.source === 'b2b';
  const quiz = lead.answers.length > 0;
  const title = b2b ? '🏢 <b>ЗАЯВКА ВІД БІЗНЕСУ</b>' : quiz ? '🧭 <b>ЗАЯВКА З КВІЗУ</b>' : '🔥 <b>НОВА ЗАЯВКА</b>';

  const who = [`👤 <b>${esc(lead.name)}</b>`];
  if (lead.phone) who.push(`📞 <code>${esc(lead.phone)}</code>`);
  if (lead.email) who.push(`✉️ ${esc(lead.email)}`);
  if (lead.channel) who.push(`💬 Зручно: <b>${esc(lead.channel)}</b>`);
  if (lead.company) who.push(`🏷 Заклад: <b>${esc(lead.company)}</b>`);
  if (lead.budget) who.push(`💰 Бюджет: <b>${esc(lead.budget)}</b>`);

  const what: string[] = [];
  if (lead.product) what.push(`🛠 Виріб: <b>${esc(lead.product)}</b>`);
  if (lead.result) what.push(`🎯 Підібрано: <b>${esc(lead.result)}</b>`);
  if (lead.config.length) what.push(`➕ Опції: ${esc(lead.config.join(' · '))}`);
  if (quiz) {
    what.push('📋 Відповіді квізу:');
    lead.answers.forEach((a, i) => what.push(`   ${i + 1}. ${esc(a)}`));
  }

  const stamp = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv', dateStyle: 'short', timeStyle: 'short' });
  const from = [`📍 Звідки: ${esc(sourceLabel(lead.source))}`];
  if (lead.page) from.push(`🔗 Сторінка: <code>${esc(lead.page)}</code>`);
  from.push(`${lead.device === 'телефон' ? '📱' : '💻'} ${lead.device} · 🕒 ${stamp}`);

  const parts = [title, RULE, ...who];
  if (what.length) parts.push(RULE, ...what);
  if (lead.comment) parts.push(RULE, `📝 <b>${b2b ? 'Задача' : 'Коментар'}:</b>`, `<blockquote>${esc(lead.comment)}</blockquote>`);
  parts.push(RULE, ...from);
  return parts.join('\n');
}

async function sendToTelegram(text: string): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { ok: false, error: 'not configured' };
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', link_preview_options: { is_disabled: true } }),
    signal: AbortSignal.timeout(10_000),
  });
  if (res.ok) return { ok: true };
  const body = await res.text().catch(() => '');
  return { ok: false, error: `telegram ${res.status}: ${body.slice(0, 200)}` };
}

function pageFromReferer(req: Request): string {
  const ref = req.headers.get('referer');
  if (!ref) return '';
  try {
    const u = new URL(ref);
    return (u.pathname + u.search).slice(0, 160);
  } catch {
    return '';
  }
}

/**
 * Diagnostics (no secrets): which of the two variables the function can see,
 * any similarly named variables (to catch typos), plus the Netlify site and
 * deploy context this code is running in.
 */
export async function GET(req: Request) {
  const names = Object.keys(process.env);
  const similar = names.filter((n) => /TELEGRAM|TG_|BOT|CHAT/i.test(n) && n !== 'TELEGRAM_BOT_TOKEN' && n !== 'TELEGRAM_CHAT_ID');
  const token = process.env.TELEGRAM_BOT_TOKEN ?? '';
  const chatId = process.env.TELEGRAM_CHAT_ID ?? '';
  // ?selftest=1 — ask Telegram (read-only getChat) from this very runtime,
  // so a blocked network, a bad token or a wrong chat id shows up here.
  let selftest: Record<string, unknown> | null = null;
  if (new URL(req.url).searchParams.has('selftest') && token && chatId) {
    try {
      const r = await fetch(`https://api.telegram.org/bot${token}/getChat?chat_id=${encodeURIComponent(chatId)}`, { signal: AbortSignal.timeout(10_000) });
      const body = (await r.json().catch(() => null)) as { ok?: boolean; description?: string; result?: { title?: string; type?: string } } | null;
      selftest = { status: r.status, ok: body?.ok ?? null, description: body?.description ?? null, chatTitle: body?.result?.title ?? null, chatType: body?.result?.type ?? null };
    } catch (err) {
      const e = err as Error & { cause?: { code?: string; message?: string } };
      selftest = { threw: e.name, message: e.message, cause: e.cause?.code ?? e.cause?.message ?? null };
    }
  }
  return NextResponse.json(
    {
      telegramToken: Boolean(token),
      telegramChatId: Boolean(chatId),
      tokenShape: token ? `${token.length} chars, ${/^\d+:[A-Za-z0-9_-]+$/.test(token) ? 'looks valid' : 'UNEXPECTED FORMAT'}` : null,
      chatIdShape: chatId ? `${chatId.length} chars, ${/^-?\d+$/.test(chatId) ? 'numeric' : 'NOT NUMERIC'}` : null,
      similarNames: similar,
      site: process.env.SITE_NAME ?? null,
      nodeVersion: process.version,
      selftest,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }

  const ua = req.headers.get('user-agent') ?? '';
  const lead: Lead = {
    name: str(data.name, 120),
    phone: str(data.phone, 40),
    email: str(data.email, 120),
    source: str(data.source, 60) || 'unknown',
    channel: str(data.channel, 40),
    comment: str(data.comment, 1500),
    company: str(data.company, 120),
    budget: str(data.budget, 80),
    product: str(data.product, 120),
    result: str(data.result, 120),
    config: list(data.config),
    answers: list(data.answers),
    page: pageFromReferer(req),
    device: /Mobi|Android|iPhone|iPad/i.test(ua) ? 'телефон' : 'комп’ютер',
  };

  // Accept either a valid phone or a valid email as a reachable contact.
  const digits = lead.phone.replace(/\D/g, '');
  const hasContact = digits.length >= 10 || /.+@.+\..+/.test(lead.email);
  if (!lead.name || !hasContact) {
    return NextResponse.json({ ok: false, error: 'Invalid submission' }, { status: 400 });
  }

  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[lead] Telegram not configured — logging only:\n' + formatMessage(lead));
      return NextResponse.json({ ok: true });
    }
    console.error('[lead] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID are not set; lead dropped:', lead);
    return NextResponse.json({ ok: false, error: 'Not configured' }, { status: 503 });
  }

  try {
    const sent = await sendToTelegram(formatMessage(lead));
    if (!sent.ok) {
      console.error('[lead] delivery failed:', sent.error, lead);
      return NextResponse.json({ ok: false, error: 'Delivery failed' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[lead] delivery error:', err, lead);
    return NextResponse.json({ ok: false, error: 'Delivery failed' }, { status: 502 });
  }
}
