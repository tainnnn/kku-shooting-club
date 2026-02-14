"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Option {
  label: string;
  value: string;
}

interface SelectBoxProps {
  value?: string;
  options: Option[];
  placeholder?: string;
  onChange?: (value: string) => void;
  width?: string;
}

export function SelectBox({
  value,
  options,
  placeholder = "เลือก",
  onChange,
  width = "w-[200px]",
}: SelectBoxProps) {
  const [open, setOpen] = React.useState(false);

  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 items-center justify-between gap-2 rounded-lg px-3 text-sm",
            width,
            "border border-gray-300 bg-white text-black",
            "hover:border-gray-400 transition",
            "focus:outline-none hover:border-gray-400"
          )}
        >
          <span
            className={selected ? "text-black" : "text-gray-400"}
          >
            {selected?.label ?? placeholder}
          </span>

          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="p-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              onChange?.(opt.value);
              setOpen(false); // ✅ ปิด popup ทันที
            }}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm",
              "hover:bg-gray-100 transition",
              value === opt.value && "bg-gray-200"
            )}
          >
            {opt.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
