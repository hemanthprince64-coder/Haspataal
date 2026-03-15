import { MetadataRoute } from 'next';

// Covers the major Indian cities and common specialties for SEO
const CITIES = [
    'delhi', 'mumbai', 'bangalore', 'hyderabad', 'chennai',
    'kolkata', 'pune', 'ahmedabad', 'jaipur', 'lucknow', 'bhopal'
];

const SPECIALTIES = [
    'cardiologist', 'dermatologist', 'pediatrician', 'gynecologist',
    'orthopedic', 'neurologist', 'psychiatrist', 'ophthalmologist',
    'dentist', 'endocrinologist', 'gastroenterologist', 'urologist',
    'general-physician', 'pulmonologist', 'nephrologist'
];

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: 'https://haspataal.com', lastModified: now, changeFrequency: 'daily', priority: 1 },
        { url: 'https://haspataal.com/doctors', lastModified: now, changeFrequency: 'daily', priority: 0.9 },
        { url: 'https://haspataal.com/hospitals', lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: 'https://haspataal.com/login', lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    ];

    // Generate all [city]/[specialty] routes — Practo-style SEO pages
    const dynamicRoutes: MetadataRoute.Sitemap = CITIES.flatMap((city) =>
        SPECIALTIES.map((specialty) => ({
            url: `https://haspataal.com/${city}/${specialty}`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))
    );

    return [...staticRoutes, ...dynamicRoutes];
}
