import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/', '/patient/'],
        },
        sitemap: 'https://haspataal.com/sitemap.xml',
    };
}
