export default function manifest() {
  return {
    name: 'Billing Application',
    short_name: 'BillingApp',
    description: 'A billing and inventory management application',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/logos/logo-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logos/logo-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
