import { Playfair_Display, Manrope } from 'next/font/google';

/**
 * Smoke O'Clock type system — editorial, matching the source template's
 * Cyrillic pairing:
 *   Playfair Display — whisper-weight display serif (headings)
 *   Manrope          — body text
 * Both carry full Cyrillic + Latin.
 */
export const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
  display: 'swap',
});

export const manrope = Manrope({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});
