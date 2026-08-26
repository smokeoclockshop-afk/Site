import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.tagline}`,
    short_name: site.name,
    description:
      'Офсетні смокери ручної роботи зі сталі 4 мм від українського майстра. Чаші, мангали, аксесуари.',
    start_url: '/',
    display: 'standalone',
    background_color: '#12100e',
    theme_color: '#e8721f',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  };
}
