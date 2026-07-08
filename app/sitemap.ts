import { MetadataRoute } from 'next'
import { cmsFetch } from '../data/client'
import { leadershipSlugs } from '../data/leadership'
import { GFNC_project, GFNC_member } from '../types'

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

const ALL_PROJECTS_QUERY = `
  *[_type == 'GFNC_project'] | order(dateCompleted desc) {
    _updatedAt,
    slug
  }
`

const LISTED_MEMBERS_QUERY = `
  *[_type == 'GFNC_member' && slug.current in $slugs] | order(startDate) {
    _updatedAt,
    slug
  }
`

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projectsData, membersData] = await Promise.all([
    cmsFetch<GFNC_project[]>({
      query: ALL_PROJECTS_QUERY,
      tags: ['GFNC_project'],
    }),
    cmsFetch<GFNC_member[]>({
      query: LISTED_MEMBERS_QUERY,
      tags: ['GFNC_member'],
      params: { slugs: leadershipSlugs },
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
