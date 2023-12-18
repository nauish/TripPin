import { useState, useEffect } from 'react';
import { addDays, addMonths, format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function DatePickerWithRange({ className, onDateChange, defaultDate }) {
  const today = new Date();
  const threeMonthFromToday = addMonths(today, 3);
  const [date, setDate] = useState({
    from: defaultDate?.from || threeMonthFromToday,
    to: defaultDate?.to || addDays(threeMonthFromToday, 6),
  });

  useEffect(() => {
    onDateChange && onDateChange(date);
  }, []);

  const handleDateChange = (newDate) => {
    setDate(newDate);
    onDateChange && onDateChange(newDate);
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'yyyy/MM/dd')} -{' '}
                  {format(date.to, 'yyyy/MM/dd')}
                </>
              ) : (
                format(date.from, 'yyyy/MM/dd')
              )
            ) : (
              <span>選個期間吧</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            fromMonth={today}
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
