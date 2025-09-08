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
  studio,
}: SelectTimeProps) => {
  // Use times as they come from API (already filtered)
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
            >
              {formatTimeRange(time.start, duration, 'Asia/Dubai')}
            </Button>
          </div>
        ))
      ) : (
        <div>No available times</div>
      )}
    </div>
  )
}

export default SelectTime
