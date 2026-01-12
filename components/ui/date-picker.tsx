"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "เลือกวันที่",
}: DatePickerProps) {
  const selectedDate = value ?? new Date();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            // layout & size (ไม่ยาวเกิน)
            "flex h-10 w-[145px] items-center gap-2 rounded-lg px-3 text-sm",

            // === ให้เหมือน Input ===
            "border border-gray-300 bg-white text-black",
            "hover:border-gray-400",
            "placeholder-gray-400",
            "transition duration-150",

            // focus เหมือน Input
            "focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600",

            // disabled (เผื่อใช้)
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <CalendarIcon className="h-4 w-4 text-gray-500" />

            {value ? (
              <span className="flex items-center tracking-[0.02em]">
                <span>{format(value, "dd")}</span>
                <span className="mx-0.5">/</span>
                <span>{format(value, "MM")}</span>
                <span className="mx-0.5">/</span>
                <span>{format(value, "yyyy")}</span>
              </span>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}

        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) onChange?.(date);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
