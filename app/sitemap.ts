import { MetadataRoute } from 'next'
import { POLICIES, policyPath } from '@/data/policies'
import { HIDDEN_COLLECTION_TILES } from '@/data/shop'
import { SHOPIFY_TAG, getCollections, getProducts } from '@/lib/shopify'
import { shopPaths } from '@/lib/shopify/format'
import { cacheLife, cacheTag } from 'next/cache'
import {
  CONTENT_TAG,
  getMembersForSitemap,
  getProjectsForSitemap,
} from '@/lib/content'

const defaultPage: MetadataRoute.Sitemap[0] = {
  url: 'https://thegoodfornothings.club',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 1,
}

const facilitiesPage: MetadataRoute.Sitemap[0] = {
  url: 'https://thegoodfornothings.club/facilities',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.9,
}

const servicesPage: MetadataRoute.Sitemap[0] = {
  url: 'https://thegoodfornothings.club/services',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.9,
}

const projectsIndexPage: MetadataRoute.Sitemap[0] = {
  url: 'https://thegoodfornothings.club/projects',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.9,
}

const eventsPage: MetadataRoute.Sitemap[0] = {
  url: 'https://thegoodfornothings.club/events',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.9,
}

const membershipPage: MetadataRoute.Sitemap[0] = {
  url: 'https://thegoodfornothings.club/membership',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.9,
}

const aboutPage: MetadataRoute.Sitemap[0] = {
  url: 'https://thegoodfornothings.club/about',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.9,
}

const contactPage: MetadataRoute.Sitemap[0] = {
  url: 'https://thegoodfornothings.club/contact',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.9,
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Cached with the content it lists; the `new Date()` fallbacks below are
  // captured when the entry is built.
  'use cache'
  cacheLife('hours')
  cacheTag(CONTENT_TAG, SHOPIFY_TAG)

  const [projectsData, membersData, collections, products] = await Promise.all([
    getProjectsForSitemap(),
    getMembersForSitemap(),
    // The sitemap shouldn't fail because Shopify did.
    getCollections().catch(() => []),
    getProducts().catch(() => []),
  ])

  const shopPages: MetadataRoute.Sitemap = [
    {
      url: `https://thegoodfornothings.club${shopPaths.home}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...collections
      .filter(c => !HIDDEN_COLLECTION_TILES.includes(c.handle))
      .map(c => ({
        url: `https://thegoodfornothings.club${shopPaths.collection(c.handle)}`,
        lastModified: new Date(c.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ...products.map(p => ({
      url: `https://thegoodfornothings.club${shopPaths.product(p.handle)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]

  const policyPages: MetadataRoute.Sitemap = POLICIES.map(policy => ({
    url: `https://thegoodfornothings.club${policyPath(policy.slug)}`,
    changeFrequency: 'yearly',
    priority: 0.3,
  }))

  const projectPages: MetadataRoute.Sitemap = projectsData.map(project => ({
    url: `https://thegoodfornothings.club/projects/${project.slug.current}`,
    lastModified: new Date(project._updatedAt),
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  const memberPages: MetadataRoute.Sitemap = membersData.map(member => ({
    url: `https://thegoodfornothings.club/members/${member.slug.current}`,
    lastModified: member._updatedAt ? new Date(member._updatedAt) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    defaultPage,
    facilitiesPage,
    servicesPage,
    eventsPage,
    membershipPage,
    ...shopPages,
    projectsIndexPage,
    ...projectPages,
    ...memberPages,
    aboutPage,
    contactPage,
    ...policyPages,
  ]
}
