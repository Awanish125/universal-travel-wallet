import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Universal Travel Wallet',
    short_name: 'Travel Wallet',
    description: 'Universal offline-first travel money and expense management application',
    start_url: '/',
    display: 'standalone',
    background_color: '#050506',
    theme_color: '#050506',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
