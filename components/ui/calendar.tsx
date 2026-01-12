"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

const CELL_SIZE = "2.5rem"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
      <DayPicker
    fixedWeeks
    showOutsideDays={showOutsideDays}
    captionLayout={captionLayout}
    formatters={{
      formatMonthDropdown: (date) =>
        date.toLocaleString("default", { month: "short" }),
      ...formatters,
    }}
    className={cn("bg-background p-3", className)}
    classNames={{
      root: "w-fit",
      months: "flex flex-col md:flex-row gap-4",
      month: "flex flex-col gap-4 min-h-[18rem]",
      nav: "flex items-center justify-between absolute inset-x-0 top-2 px-3",
      button_previous: cn(
        buttonVariants({ variant: buttonVariant }),
        "h-8 w-8 p-0 rounded-full flex items-center justify-center",
        "transition-colors hover:bg-rose-100 hover:text-rose-700",
      ),
      button_next: cn(
        buttonVariants({ variant: buttonVariant }),
        "h-8 w-8 p-0 rounded-full flex items-center justify-center",
        "transition-colors hover:bg-rose-100 hover:text-rose-700",
      ),
      month_caption: "flex items-center justify-center w-full",
      table: "w-full border-collapse",
      weekdays: "flex",
      weekday:
        "flex-1 text-center text-muted-foreground text-xs font-normal",
      week: "flex w-full",
      day: "flex items-center justify-center",
      today: "",
      selected: "",
      ...classNames,
    }}
    components={{
      Chevron: ({ orientation, className }) => {
        if (orientation === "left")
          return <ChevronLeftIcon className={cn("h-4 w-4", className)} />
        if (orientation === "right")
          return <ChevronRightIcon className={cn("h-4 w-4", className)} />
        return <ChevronDownIcon className={cn("h-4 w-4", className)} />
      },
      DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      style={{ width: CELL_SIZE, height: CELL_SIZE }}
      className={cn(
        "group rounded-full transition-colors",
        // ----- outside days → จางเฉพาะตัวเลข
        modifiers.outside &&
          "text-[#A5ABB0]",

        // ----- hover ปกติ (เฉพาะวันในเดือน)
        !modifiers.outside &&
          !modifiers.selected &&
          "hover:bg-rose-100 hover:text-rose-700",

        // ----- today = hover style (ถ้าอยู่ในเดือน)
        modifiers.today &&
          !modifiers.selected &&
          !modifiers.outside &&
          "bg-rose-100 text-rose-700",

        // hover ปกติ (ยังไม่ selected)
        !modifiers.selected &&
          "hover:bg-rose-100 hover:text-rose-700",

        // today = hover style
        modifiers.today &&
          !modifiers.selected &&
          "bg-rose-100 text-rose-700",

        // selected (base)
        modifiers.selected &&
          "bg-rose-600 text-white",

        // hover ทับ selected → เปลี่ยนแค่สี text
        modifiers.selected &&
          "hover:text-rose-100 hover:bg-rose-600",

        className
      )}
      {...props}
    >
      {day.date.getDate()}
    </Button>
  )
}
export { Calendar }
