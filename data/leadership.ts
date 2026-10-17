/**
 * Leadership - the founding crew that runs the club - plus past members.
 *
 * "Members" now means people with a monthly rental subscription (see
 * /membership); the people listed on the site are the founding team.
 * Profiles live in Convex (members table) - these allowlists control who
 * appears. Edit directly to add/remove someone.
 */

export const leadershipSlugs = [
  'jason-desiderio',
  'chris-donahue',
  'max-marschark',
  'matt-schaefer',
]

export const pastMemberSlugs = ['eric-fenny']

/**
 * Members' own websites, shown on their profile page. A plain link from
 * here helps search engines tie the member's site to their name.
 */
export const memberWebsites: Record<string, string> = {
  'jason-desiderio': 'https://jasondesiderio.com',
}

export const leadershipCopy = {
  title: 'Founding Members',
  lead: 'The crew that runs the clubhouse.',
  pastTitle: 'Past Members',
}
