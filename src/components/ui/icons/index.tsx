export function ArrowIcon({
  size = 24,
  degree = 0,
  className = '',
}: {
  size?: number
  degree?: number
  className?: string
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`${className} size-${size}`}
      fill="none"
      style={{ transform: `rotate(${degree}deg)` }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth="1.5"
        d="M14.43 5.93 20.5 12l-6.07 6.07M3.5 12h16.83"
      />
    </svg>
  )
}
