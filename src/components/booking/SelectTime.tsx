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
  const filteredTimes = times.filter(time => {
    const withinWorkingHours =
      !studio ||
      isSlotWithinWorkingHours(
        time.start,
        duration,
        studio.openingTime,
        studio.closingTime
      )

    const isAvailable = isSlotAvailable(time.start, duration, times)
    return withinWorkingHours && isAvailable
  })

  return (
    <div className="grid grid-cols-4 gap-4">
      {filteredTimes?.length > 0 ? (
        filteredTimes.map(time => (
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
