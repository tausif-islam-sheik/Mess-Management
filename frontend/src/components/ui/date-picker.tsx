"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function toISODateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseISODateString(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return undefined;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return isNaN(date.getTime()) ? undefined : date;
}

interface DatePickerProps {
  /** Date as `yyyy-MM-dd` (same shape as the old native date inputs). */
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * shadcn-style date picker (Popover + Calendar) used website-wide
 * wherever a date is entered.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  required,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseISODateString(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal border-slate-700 bg-slate-800/80 text-slate-100 hover:bg-slate-800 hover:text-white",
            !selected && "text-slate-500",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-emerald-400" />
          {selected ? format(selected, "MMM d, yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) {
              onChange?.(toISODateString(date));
              setOpen(false);
            }
          }}
          disabled={disabled}
          initialFocus
        />
        {required && (
          <input
            type="hidden"
            required={selected ? undefined : true}
            value={selected ? "ok" : ""}
            onChange={() => {}}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
