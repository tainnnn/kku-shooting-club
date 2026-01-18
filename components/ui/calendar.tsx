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
import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

/* ------------------------------------------------------------------ */
/* constants */
/* ------------------------------------------------------------------ */

const CELL_SIZE = "2.5rem"

/* ------------------------------------------------------------------ */
/* animation */
/* ------------------------------------------------------------------ */

const gridVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 24 : -24,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -24 : 24,
    opacity: 0,
  }),
}

/* ------------------------------------------------------------------ */
/* animation context */
/* ------------------------------------------------------------------ */

const CalendarAnimationContext = React.createContext<{
  month: Date
  direction: 1 | -1
}>({
  month: new Date(),
  direction: 1,
})

/* ------------------------------------------------------------------ */
/* Animated MonthGrid (ONLY table animates) */
/* ------------------------------------------------------------------ */

function AnimatedMonthGrid(
  props: React.HTMLAttributes<HTMLTableElement>
) {
  const { month, direction } = React.useContext(
    CalendarAnimationContext
  )

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.table
        key={month.toISOString()}
        custom={direction}
        variants={gridVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          duration: 0.13,
          ease: "easeOut",
        }}
        className={cn(
          "w-full border-collapse will-change-transform",
          props.className
        )}
      >
        {props.children}
      </motion.table>
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ */
/* Calendar */
/* ------------------------------------------------------------------ */

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

  const [month, setMonth] = React.useState(new Date())
  const [direction, setDirection] = React.useState<1 | -1>(1)

  const handleMonthChange = (newMonth: Date) => {
    setDirection(newMonth > month ? 1 : -1)
    setMonth(newMonth)
  }

  return (
    <CalendarAnimationContext.Provider
      value={{ month, direction }}
    >
      <DayPicker
        month={month}
        onMonthChange={handleMonthChange}
        fixedWeeks
        showOutsideDays={showOutsideDays}
        captionLayout={captionLayout}
        formatters={{
          formatMonthDropdown: (date) =>
            date.toLocaleString("default", { month: "short" }),
          ...formatters,
        }}
        className={cn("bg-background p-4 pt-4", className)}
        classNames={{
          root: "w-fit",
          months: "flex flex-col md:flex-row gap-4",
          month: "flex flex-col gap-4 min-h-[18rem]",
          nav:
            "flex items-center justify-between absolute inset-x-0 top-3 px-3",
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
          weekdays: "flex mb-1",
          weekday:
            "flex-1 text-center text-muted-foreground text-xs font-normal",
          week: "flex w-full",
          day: "flex items-center justify-center",
          today: "",
          selected: "",
          ...classNames,
        }}
        components={{
          MonthGrid: AnimatedMonthGrid, // ✅ ถูกจุด
          Chevron: ({ orientation, className }) => {
            if (orientation === "left")
              return (
                <ChevronLeftIcon
                  className={cn("h-4 w-4", className)}
                />
              )
            if (orientation === "right")
              return (
                <ChevronRightIcon
                  className={cn("h-4 w-4", className)}
                />
              )
            return (
              <ChevronDownIcon
                className={cn("h-4 w-4", className)}
              />
            )
          },
          DayButton: CalendarDayButton,
          ...components,
        }}
        {...props}
      />
    </CalendarAnimationContext.Provider>
  )
}

/* ------------------------------------------------------------------ */
/* Day Button */
/* ------------------------------------------------------------------ */

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
        "rounded-full transition-colors",

        // outside days (base)
        modifiers.outside && "text-[#A5ABB0]",

        // outside hover (soft)
        modifiers.outside &&
          !modifiers.selected &&
          "hover:bg-rose-100 hover:text-rose-700",

        // normal hover
        !modifiers.outside &&
          !modifiers.selected &&
          "hover:bg-rose-100 hover:text-rose-700",

        modifiers.today &&
          !modifiers.selected &&
          !modifiers.outside &&
          "bg-rose-100 text-rose-700",

        modifiers.selected && "bg-rose-600 text-white",

        modifiers.selected &&
          "hover:bg-rose-600 hover:text-rose-100",

        className
      )}
      {...props}
    >
      {day.date.getDate()}
    </Button>
  )
}

export { Calendar }
