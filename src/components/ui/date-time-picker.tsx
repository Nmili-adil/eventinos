import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export interface DateTimePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  disabled?: boolean
  className?: string
  placeholder?: string
  fromDate?: Date
  toDate?: Date
}

const DateTimePicker = React.forwardRef<HTMLButtonElement, DateTimePickerProps>(
  ({ value, onChange, disabled = false, className, placeholder = "Pick a date and time", fromDate, toDate }, ref) => {
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value)
    const [time, setTime] = React.useState(value ? format(value, "HH:mm") : "")

    React.useEffect(() => {
      setSelectedDate(value)
      setTime(value ? format(value, "HH:mm") : "")
    }, [value])

    const handleDateSelect = (date: Date | undefined) => {
      if (date) {
        let newDate = new Date(date)
        
        // If we have a time already, apply it to the new date
        if (time) {
          const [hours, minutes] = time.split(':').map(Number)
          newDate.setHours(hours, minutes)
        } else {
          // Default to current time if no time selected
          const now = new Date()
          newDate.setHours(now.getHours(), now.getMinutes())
          setTime(format(now, "HH:mm"))
        }
        
        setSelectedDate(newDate)
        onChange(newDate)
      } else {
        setSelectedDate(undefined)
        setTime("")
        onChange(undefined)
      }
    }

    const handleTimeChange = (newTime: string) => {
      setTime(newTime)
      
      if (selectedDate && newTime) {
        const [hours, minutes] = newTime.split(':').map(Number)
        const newDate = new Date(selectedDate)
        newDate.setHours(hours, minutes)
        setSelectedDate(newDate)
        onChange(newDate)
      }
    }

    const generateTimeOptions = () => {
      const options = []
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          options.push(timeString)
        }
      }
      return options
    }

    return (
      <div className={cn("flex gap-2", className)}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
              disabled={disabled}
              ref={ref}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "PPP")
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => {
                if (fromDate && date < fromDate) return true
                if (toDate && date > toDate) return true
                return false
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Select value={time} onValueChange={handleTimeChange} disabled={disabled}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Time">
              {time || "Select time"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {generateTimeOptions().map((timeOption) => (
              <SelectItem key={timeOption} value={timeOption}>
                {timeOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }
)

DateTimePicker.displayName = "DateTimePicker"

export { DateTimePicker }