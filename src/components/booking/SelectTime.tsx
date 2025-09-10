import { Studio, TimeSlotList } from '../../types'
import { Button } from '../ui/button'
import { formatTimeRange } from '../../utils/time'

type SelectTimeProps = {
  times: TimeSlotList[]
  selectedTime: string
  onSelectTime: (time: string) => void
  duration: number
  studio?: Studio
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
    <div className="grid grid-cols-4 gap-4">
      {availableTimes?.length > 0 ? (
        availableTimes.map(time => (
          <div key={time.start}>
            <Button
              type="button"
              variant={selectedTime === time.start ? 'default' : 'secondary'}
              onClick={() => onSelectTime(time.start)}
              className="w-full"
            >
              {formatTimeRange(time.start, duration, 'Asia/Dubai')}
            </Button>
          </div>
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
