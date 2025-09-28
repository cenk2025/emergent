/**
 * Sitemap.xml generator for FoodAi
 * Generates dynamic sitemap for search engines
 */

export async function GET() {
  const baseUrl = 'https://foodai.fi';
  const currentDate = new Date().toISOString();

  const staticPages = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/kayttoehdot`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/tietosuoja`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/saavutettavuus`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/ota-yhteytta`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Generate dynamic pages for cities and cuisines if needed
  const cities = ['helsinki', 'tampere', 'turku', 'oulu', 'espoo', 'vantaa'];
  const cuisines = ['pizza', 'sushi', 'hamburger', 'kiinalainen', 'intialainen', 'thai'];

  const dynamicPages = [
    ...cities.map(city => ({
      url: `${baseUrl}/kaupunki/${city}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
    ...cuisines.map(cuisine => ({
      url: `${baseUrl}/keittio/${cuisine}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    })),
  ];

  const allPages = [...staticPages, ...dynamicPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allPages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
    },
  });
}