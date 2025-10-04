import { Studio, TimeSlotList } from '../../types'
import { Button } from '../ui/button'
import { formatTimeRange } from '../../utils/time'

type SelectTimeProps = {
  times: TimeSlotList[]
  selectedTime: string
  onSelectTime: (time: string) => void
  duration: number
}

const SelectTime = ({
  times,
  selectedTime,
  onSelectTime,
  duration,
}: SelectTimeProps) => {
  // Use times as they come from API (already filtered for duration)
  const availableTimes = times.filter(time => time.available)

  return (
    <div className="grid sm:grid-cols-3 grid-cols-2 lg:gap-x-4 gap-x-2 sm:gap-y-8 gap-y-4">
      {availableTimes?.length > 0 ? (
        availableTimes.map(time => (
          <Button
            key={time.start}
            type="button"
            variant={selectedTime === time.start ? 'accent' : 'secondary'}
            onClick={() => onSelectTime(time.start)}
            className="w-full rounded-xl p-2 h-8"
          >
            <span className="text-base">
              {formatTimeRange(time.start, duration, 'Asia/Dubai')}
            </span>
          </Button>
        ))
      ) : (
        <div className="col-span-4 text-center text-gray-500 py-4">
          No available times for {duration} hour{duration > 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

export default SelectTime
