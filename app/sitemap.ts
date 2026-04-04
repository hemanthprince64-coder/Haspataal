import { MetadataRoute } from 'next';
import { services } from '@/lib/services';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();
    
    // Fetch real cities and specialties from the database for dynamic SEO indexing
    const { cities, specialties } = await services.platform.getHubMetadata();

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: 'https://haspataal.com', lastModified: now, changeFrequency: 'daily', priority: 1 },
        { url: 'https://haspataal.com/doctors', lastModified: now, changeFrequency: 'daily', priority: 0.9 },
        { url: 'https://haspataal.com/hospitals', lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: 'https://haspataal.com/login', lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    ];

    // Generate all [city]/[specialty] routes from live data — Practo-style SEO coverage
    const dynamicRoutes: MetadataRoute.Sitemap = cities.flatMap((city) =>
        specialties.map((specialty) => ({
            url: `https://haspataal.com/${city.toLowerCase()}/${specialty.toLowerCase().replace(/\s+/g, '-')}`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))
    );

    return [...staticRoutes, ...dynamicRoutes];
}
