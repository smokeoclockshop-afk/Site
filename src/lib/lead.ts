/** Client-side lead helpers shared by the order modal and lead forms. */

export function isValidPhone(v: string): boolean {
  return v.replace(/\D/g, '').length >= 10;
}

export async function submitLead(data: Record<string, unknown>): Promise<void> {
  const res = await fetch('/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('bad status');
}
