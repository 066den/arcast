import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { ArrowIcon } from '../ui/icons'

interface ServiceButtonProps {
  icon?: React.ReactNode
  title: string
  isActive?: boolean
}

const ServiceButton = ({ icon, title, isActive }: ServiceButtonProps) => {
  return (
    <Button
      size="custom"
      variant="outline"
      className={cn(
        'justify-between w-full max-w-sm h-15 rounded-full font-medium text-dark-mode font-geist tracking-tight hover:bg-white hover:text-accent shadow-none text-xl p-1',
        isActive && 'bg-muted text-primary'
      )}
    >
      <div className="flex items-center gap-4 px-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="10"
          fill="none"
          viewBox="0 0 16 10"
        >
          <circle cx="5" cy="5" r="5" fill="#FDAEA7" />
          <circle cx="11" cy="5" r="5" fill="#F26430" />
        </svg>
        {title}
      </div>
      <span
        className={cn(
          'flex items-center justify-center rounded-full bg-muted p-3',
          isActive && 'bg-accent'
        )}
      >
        {icon || (
          <ArrowIcon
            size={24}
            degree={-45}
            className={cn('stroke-accent', isActive && 'stroke-white')}
          />
        )}
      </span>
    </Button>
  )
}

export default ServiceButton
