import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/search', '/hospitals', '/doctors', '/specialities'],
        disallow: [
          '/api/',
          '/admin/',
          '/patient/',
          '/hospital/',
          '/(patient)/',
          '/(hospital)/',
          '/(doctor)/',
          '/(agent)/',
        ],
      },
    ],
    sitemap: 'https://haspataal.com/sitemap.xml',
  };
}
