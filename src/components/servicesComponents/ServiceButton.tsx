import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { ArrowIcon } from '../ui/icons'

interface ServiceButtonProps {
  icon?: React.ReactNode
  title: string
  isActive?: boolean
  isHorizontal?: boolean
  onClick: () => void
}

const ServiceButton = ({
  icon,
  title,
  isActive,
  onClick,
  isHorizontal,
}: ServiceButtonProps) => {
  return (
    <Button
      size="custom"
      variant="outline"
      className={cn(
        'justify-center lg:justify-between w-full max-w-[400px] h-14 xl:h-15 rounded-full font-medium text-dark-mode font-geist tracking-tight hover:bg-white hover:text-accent shadow-none text-base xl:text-xl px-4 has-[svg]:px-1',
        isActive && 'bg-muted text-accent hover:bg-muted'
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          'flex items-center gap-1 xl:gap-4 px-2 2xl:px-4',
          isHorizontal && 'justify-center'
        )}
      >
        {!isHorizontal && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="10"
            fill="none"
            viewBox="0 0 16 10"
            className="lg:block hidden"
          >
            <circle cx="5" cy="5" r="5" fill="#FDAEA7" />
            <circle cx="11" cy="5" r="5" fill="#F26430" />
          </svg>
        )}
        {title}
      </div>
      {!isHorizontal && (
        <span
          className={cn(
            'hidden lg:flex items-center justify-center rounded-full bg-muted p-3',
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
      )}
    </Button>
  )
}

export default ServiceButton
