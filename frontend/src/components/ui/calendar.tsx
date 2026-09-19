"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * shadcn-style Calendar (react-day-picker) themed for the dark slate UI.
 * Used across the whole website via the `DatePicker` component.
 */
export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: "bg-slate-900 text-slate-100",
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-bold text-white",
        dropdowns: "flex items-center gap-1.5",
        dropdown: "bg-slate-800 border border-slate-700 rounded-md text-xs text-slate-100 px-1.5 py-1 outline-none focus:border-emerald-500",
        dropdown_root: "relative",
        nav: "flex items-center gap-1",
        button_previous:
          "h-7 w-7 bg-transparent p-0 rounded-md border border-slate-700 text-slate-300 opacity-70 hover:opacity-100 hover:bg-slate-800 hover:text-white transition-colors inline-flex items-center justify-center",
        button_next:
          "h-7 w-7 bg-transparent p-0 rounded-md border border-slate-700 text-slate-300 opacity-70 hover:opacity-100 hover:bg-slate-800 hover:text-white transition-colors inline-flex items-center justify-center",
        weekdays: "flex",
        weekday: "text-slate-500 rounded-md w-8 font-semibold text-[0.8rem]",
        weeks: "flex flex-col gap-0.5",
        week: "flex w-full mt-1",
        day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button:
          "h-8 w-8 p-0 font-medium rounded-md text-slate-200 hover:bg-slate-800 hover:text-white transition-colors inline-flex items-center justify-center aria-selected:opacity-100",
        selected:
          "[&>button]:bg-emerald-600 [&>button]:text-white [&>button]:hover:bg-emerald-500 [&>button]:font-bold",
        today: "[&>button]:border [&>button]:border-emerald-500/60 [&>button]:text-emerald-300",
        outside: "[&>button]:text-slate-600 [&>button]:opacity-50",
        disabled: "[&>button]:text-slate-700 [&>button]:opacity-40",
        hidden: "invisible",
        footer: "pt-3 text-xs text-slate-400",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...chevronProps }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" {...chevronProps} />
          ) : (
            <ChevronRight className="h-4 w-4" {...chevronProps} />
          ),
      }}
      {...props}
    />
  );
}
