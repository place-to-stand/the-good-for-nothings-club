import { MetadataRoute } from 'next'
import { cmsFetch } from '../data/client'
import { GFNC_project, GFNC_member } from '../types'

const defaultPage: MetadataRoute.Sitemap[0] = {
  url: 'https://www.thegoodfornothings.club',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 1,
}

const projectsPage: MetadataRoute.Sitemap[0] = {
  url: 'https://www.thegoodfornothings.club/projects',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.9,
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

const ALL_MEMBERS_QUERY = `
  *[_type == 'GFNC_member'] | order(startDate) {
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
      query: ALL_MEMBERS_QUERY,
      tags: ['GFNC_member'],
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
    projectsPage,
    ...projectPages,
    ...memberPages,
    aboutPage,
    contactPage,
  ]
}
