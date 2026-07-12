import { MetadataRoute } from 'next'
import { fetchQuery } from 'convex/nextjs'
import { api } from '../convex/_generated/api'
import { leadershipSlugs, pastMemberSlugs } from '../data/leadership'

const defaultPage: MetadataRoute.Sitemap[0] = {
  url: 'https://www.thegoodfornothings.club',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 1,
}

const facilitiesPage: MetadataRoute.Sitemap[0] = {
  url: 'https://www.thegoodfornothings.club/facilities',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.9,
}

const servicesPage: MetadataRoute.Sitemap[0] = {
  url: 'https://www.thegoodfornothings.club/services',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.9,
}

const eventsPage: MetadataRoute.Sitemap[0] = {
  url: 'https://www.thegoodfornothings.club/events',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.9,
}

const membershipPage: MetadataRoute.Sitemap[0] = {
  url: 'https://www.thegoodfornothings.club/membership',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.9,
}

const aboutPage: MetadataRoute.Sitemap[0] = {
  url: 'https://www.thegoodfornothings.club/about',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.9,
}

const contactPage: MetadataRoute.Sitemap[0] = {
  url: 'https://www.thegoodfornothings.club/contact',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.9,
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projectsData, membersData] = await Promise.all([
    fetchQuery(api.projects.forSitemap, {}),
    fetchQuery(api.members.forSitemap, {
      slugs: [...leadershipSlugs, ...pastMemberSlugs],
    }),
  ])

  const projectPages: MetadataRoute.Sitemap = projectsData.map(project => ({
    url: `https://www.thegoodfornothings.club/projects/${project.slug.current}`,
    lastModified: new Date(project._updatedAt),
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  const memberPages: MetadataRoute.Sitemap = membersData.map(member => ({
    url: `https://www.thegoodfornothings.club/members/${member.slug.current}`,
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
    ...projectPages,
    ...memberPages,
    aboutPage,
    contactPage,
  ]
}
