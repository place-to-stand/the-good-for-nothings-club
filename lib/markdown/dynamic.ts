import type { GFNC_member, GFNC_project, GFNC_projectListItem } from '@/types'
import { pastMemberSlugs } from '@/data/leadership'
import { PAGE_META, SITE_URL } from '@/data/site'
import { portableTextToMarkdown } from './portableText'
import { abs, pageFooter } from './pages'

/**
 * Markdown views of the Convex-backed pages (projects and members). Pure
 * functions over the same data the HTML templates receive, so they are
 * unit-testable with fixtures and never touch the network themselves.
 */

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

type ProjectSummary = Pick<
  GFNC_projectListItem,
  | 'title'
  | 'clientName'
  | 'slug'
  | 'type'
  | 'status'
  | 'dateStarted'
  | 'dateCompleted'
  | 'summary'
>

function projectLine(project: ProjectSummary) {
  const dates = [project.dateStarted, project.dateCompleted]
    .filter((d): d is string => Boolean(d))
    .map(shortDate)
  const meta = [project.type, project.status, dates.join(' – ')]
    .filter(Boolean)
    .join(' · ')
  const summary = portableTextToMarkdown(project.summary).split('\n')[0]
  return `- [${project.title}](${abs(`/projects/${project.slug.current}`)}) — ${project.clientName} (${meta})${summary ? `: ${summary}` : ''}`
}

export function projectsIndexMarkdown(projects: ProjectSummary[]) {
  const groups: Array<[string, ProjectSummary[]]> = [
    ['In Progress', projects.filter(p => p.status === 'In Progress')],
    ['Completed', projects.filter(p => p.status === 'Completed')],
    ['Paused', projects.filter(p => p.status === 'Paused')],
    ['Canceled', projects.filter(p => p.status === 'Canceled')],
  ]
  const lines = [
    `# ${PAGE_META['/projects'].title}`,
    '',
    `> ${PAGE_META['/projects'].description}`,
    '',
    `Filter by type in HTML: ${['Audio', 'Build', 'Event', 'Photo', 'Video', 'Web'].map(t => `[${t}](${abs(`/projects?type=${t}`)})`).join(' · ')}`,
    '',
  ]
  for (const [label, group] of groups) {
    if (group.length === 0) continue
    lines.push(
      `## ${label} (${group.length})`,
      '',
      ...group.map(projectLine),
      ''
    )
  }
  if (projects.length === 0) lines.push('No projects published yet.', '')
  lines.push(pageFooter('/projects'))
  return lines.join('\n')
}

export function projectMarkdown(project: GFNC_project) {
  const path = `/projects/${project.slug.current}`
  const facts = [
    `- **Client:** ${project.clientName}`,
    `- **Type:** ${project.type}`,
    `- **Status:** ${project.status}`,
    project.dateStarted
      ? `- **Started:** ${shortDate(project.dateStarted)}`
      : null,
    project.dateCompleted
      ? `- **Completed:** ${shortDate(project.dateCompleted)}`
      : null,
    project.mainLink ? `- **Link:** ${project.mainLink}` : null,
  ].filter((line): line is string => line !== null)

  const summary = portableTextToMarkdown(project.summary)
  const overview = portableTextToMarkdown(project.overview)
  const caseStudy = portableTextToMarkdown(project.caseStudy)
  const images = (project.mainMedia ?? []).filter(m => m._type === 'image')
  const gallery = project.photoGallery ?? []

  const lines = [
    `# ${project.title}`,
    '',
    `> ${project.seoDescription?.trim() || summary || project.clientName}`,
    '',
    ...facts,
    '',
  ]
  if (overview) lines.push('## Overview', '', overview, '')
  if (caseStudy) lines.push('## Case study', '', caseStudy, '')
  if (project.membersInvolved?.length) {
    lines.push(
      '## Members involved',
      '',
      ...project.membersInvolved.map(
        m => `- [${m.fullName}](${abs(`/members/${m.slug.current}`)})`
      ),
      ''
    )
  }
  if (images.length + gallery.length > 0) {
    lines.push('## Media', '')
    for (const image of [...images, ...gallery]) {
      lines.push(`- ![${image.caption ?? ''}](${image.asset.url})`)
    }
    lines.push('')
  }
  lines.push(pageFooter(path))
  return lines.join('\n')
}

export function memberMarkdown(
  member: GFNC_member,
  projects: ProjectSummary[]
) {
  const path = `/members/${member.slug.current}`
  const kind = pastMemberSlugs.includes(member.slug.current)
    ? 'a past member'
    : 'a founding member'
  const lines = [
    `# ${member.fullName}`,
    '',
    `> ${member.fullName} is ${kind} of The Good for Nothings Club in Austin, TX — ${member.roles.join(', ')}.`,
    '',
    `- **Member number:** #${String(member.memberNumber).padStart(3, '0')}`,
    `- **Member since:** ${longDate(member.startDate)}`,
    `- **Roles:** ${member.roles.join(', ')}`,
    `- **Profile picture:** ${member.profilePicture?.asset?.url ?? `${SITE_URL}/opengraph-image.png`}`,
    '',
    `Back to [About](${abs('/about')}).`,
    '',
  ]
  if (projects.length > 0) {
    lines.push(
      `## Projects (${projects.length})`,
      '',
      ...projects.map(projectLine),
      '',
      `All projects: ${abs('/projects')}`,
      ''
    )
  }
  lines.push(pageFooter(path))
  return lines.join('\n')
}
