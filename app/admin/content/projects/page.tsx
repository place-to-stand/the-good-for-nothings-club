'use client'

import { Authenticated, useQuery } from 'convex/react'
import Image from 'next/image'

import { api } from '@/convex/_generated/api'

function Projects() {
  const projects = useQuery(api.admin.listProjects)

  if (projects === undefined) {
    return <p className='font-sans text-sm text-black/60'>Loading…</p>
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full font-sans text-sm'>
        <thead>
          <tr className='border-b-2 border-black text-left uppercase tracking-[1px]'>
            <th className='py-2 pr-4'>Project</th>
            <th className='py-2 pr-4'>Type</th>
            <th className='py-2 pr-4'>Status</th>
            <th className='py-2 pr-4'>Dates</th>
            <th className='py-2'>Members</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={project._id} className='border-b border-black/20 align-top'>
              <td className='py-3 pr-4'>
                <div className='flex items-center gap-3'>
                  {project.thumbnail && (
                    <Image
                      src={project.thumbnail.url}
                      alt={project.thumbnail.caption ?? project.title}
                      width={96}
                      height={96}
                      className='h-12 w-12 shrink-0 border border-black/20 object-cover'
                    />
                  )}
                  <div>
                    <div className='font-bold'>
                      {project.title}
                      {project.featured && (
                        <span className='ml-2 border border-black px-1 text-xs uppercase'>
                          featured
                        </span>
                      )}
                    </div>
                    <div className='text-black/60'>{project.clientName}</div>
                    <a
                      href={`/projects/${project.slug}`}
                      className='text-xs text-black/60 underline'
                      target='_blank'
                    >
                      /projects/{project.slug}
                    </a>
                  </div>
                </div>
              </td>
              <td className='py-3 pr-4'>{project.type}</td>
              <td className='py-3 pr-4'>{project.status}</td>
              <td className='py-3 pr-4 whitespace-nowrap'>
                {project.dateStarted ?? '—'}
                {project.dateCompleted && ` → ${project.dateCompleted}`}
              </td>
              <td className='py-3'>{project.members.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminProjectsPage() {
  return (
    <Authenticated>
      <Projects />
    </Authenticated>
  )
}
