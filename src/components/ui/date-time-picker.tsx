// components/ui/date-time-picker.tsx
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface DateTimePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  fromDate?: Date;
  toDate?: Date;
}

const DateTimePicker = React.forwardRef<HTMLButtonElement, DateTimePickerProps>(
  (
    {
      date,
      onDateChange,
      placeholder = "Pick a date and time",
      disabled = false,
      className,
      fromDate,
      toDate,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
    const [time, setTime] = React.useState(
      date ? format(date, "HH:mm") : "00:00"
    );

    React.useEffect(() => {
      if (date) {
        setSelectedDate(date);
        setTime(format(date, "HH:mm"));
      }
    }, [date]);

    const handleDateSelect = (newDate: Date | undefined) => {
      setSelectedDate(newDate);
      
      if (newDate && time) {
        const [hours, minutes] = time.split(":").map(Number);
        const newDateTime = new Date(newDate);
        newDateTime.setHours(hours, minutes);
        onDateChange?.(newDateTime);
      } else {
        onDateChange?.(newDate);
      }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = e.target.value;
      setTime(newTime);
      
      if (selectedDate && newTime) {
        const [hours, minutes] = newTime.split(":").map(Number);
        const newDateTime = new Date(selectedDate);
        newDateTime.setHours(hours, minutes);
        onDateChange?.(newDateTime);
      }
    };

    return (
      <div className={cn("space-y-2", className)}>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
              disabled={disabled}
              ref={ref}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP HH:mm") : <span>{placeholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                fromDate={fromDate}
                toDate={toDate}
                initialFocus
              />
              <div className="mt-3 space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={handleTimeChange}
                  className="w-full"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

DateTimePicker.displayName = "DateTimePicker";

export { DateTimePicker };