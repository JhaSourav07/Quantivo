export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/private'], // Add any private routes you don't want on Google
    },
    sitemap: 'https://stockenza.co.in/sitemap.xml',
  }
}