import { Button } from './button'

interface ServiceButtonProps {
  icon?: React.ReactNode
  title: string
}

const ServiceButton = ({ icon, title }: ServiceButtonProps) => {
  return (
    <Button
      size="custom"
      variant="outline"
      className="justify-between w-full h-15 rounded-full font-medium text-dark-mode font-geist tracking-tight group hover:bg-white hover:text-primary shadow-none text-xl p-1"
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
      <span className="flex items-center justify-center rounded-full bg-muted p-2 group-hover:bg-accent">
        {icon || (
          <ArrowUpRightIcon
            size={34}
            className="stroke-accent group-hover:stroke-white transition-all duration-300"
          />
        )}
      </span>
    </Button>
  )
}

export default ServiceButton
function ArrowUpRightIcon({
  size = 24,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 34 34"
      width={size}
      height={size}
      className={`${className} size-${size}`}
      fill="none"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth="1.5"
        d="M14.426 10.99h8.584v8.584M10.99 23.01l11.9-11.9"
      />
    </svg>
  )
}
