import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/about', '/deals', '/compare'],
      disallow: ['/api/', '/auth/signin', '/auth/signup']
    },
    sitemap: 'https://verayield.com/sitemap.xml'
  };
}