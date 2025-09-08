import { Studio, TimeSlotList } from '../../types'
import { Button } from '../ui/button'
import {
  formatTimeRange,
  isSlotAvailable,
  isSlotWithinWorkingHours,
} from '../../utils/time'

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
  // Filter to show only available times
  const availableTimes = times.filter(time => {
    const withinWorkingHours =
      !studio ||
      isSlotWithinWorkingHours(
        time.start,
        duration,
        studio.openingTime,
        studio.closingTime
      )

    const slotIsAvailable = isSlotAvailable(time.start, duration, times)
    return time.available && withinWorkingHours && slotIsAvailable
  })

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
              {formatTimeRange(time.start, duration)}
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
