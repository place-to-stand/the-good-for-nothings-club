import ProjectCardSmall from '@/components/ProjectCardSmall'
import { GFNC_projectListItem } from '@/types'

type InProgressSectionProps = {
  projectsData: GFNC_projectListItem[]
}

const InProgressSection = ({ projectsData }: InProgressSectionProps) => {
  return (
    <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black px-4 py-6 md:border-x-2 md:px-12 md:py-12'>
      <div className='flex items-center gap-4'>
        <div className='h-5 w-5 rounded-full border-2 border-black bg-green-300'></div>
        <h2 className='text-[32px] leading-none font-black tracking-[-0.04em] md:text-[48px] lg:text-[64px]'>
          In Progress
        </h2>
      </div>
      <div className='mt-8 grid grid-cols-1 gap-4 md:mt-12 md:gap-8 lg:grid-cols-2 xl:grid-cols-3'>
        {projectsData.map(project => {
          return <ProjectCardSmall key={project._id} project={project} />
        })}
      </div>
    </div>
  )
}

export default InProgressSection
