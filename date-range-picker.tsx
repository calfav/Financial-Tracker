import * as React from "react"
import { CalendarIcon } from "@radix-ui/react-icons"
import { addMonths, format } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  className?: string
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
}

export function DateRangePicker({
  className,
  dateRange,
  onDateRangeChange
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
          />
          <div className="grid grid-cols-3 gap-2 p-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const from = new Date(today.getFullYear(), today.getMonth(), 1);
                const to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                onDateRangeChange({ from, to });
              }}
            >
              This Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const prevMonth = addMonths(today, -1);
                const from = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
                const to = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0);
                onDateRangeChange({ from, to });
              }}
            >
              Last Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const from = new Date(today.getFullYear(), 0, 1);
                const to = new Date(today.getFullYear(), 11, 31);
                onDateRangeChange({ from, to });
              }}
            >
              This Year
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}