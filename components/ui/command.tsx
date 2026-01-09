'use client';

import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { cn } from '@/lib/utils';

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-lg',
      'bg-white text-gray-800', // สีพื้น/ตัวอักษร
      className
    )}
    {...props}
  />
));
Command.displayName = 'Command';

// ช่องค้นหา
const CommandInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-gray-200 px-3">
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'h-10 w-full bg-transparent py-3 text-sm outline-none',
        'placeholder:text-gray-400',
        className
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = 'CommandInput';

// รายการ + สกรอลล์ (จำกัดความสูง)
const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-64 overflow-auto scrollbar-kku', className)}
    {...props}
  />
));
CommandList.displayName = 'CommandList';

// เมื่อผลลัพธ์ว่าง
const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={cn('py-6 text-center text-sm text-gray-500', className)}
    {...props}
  />
));
CommandEmpty.displayName = 'CommandEmpty';

// กลุ่มรายการ
const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn('p-1 text-gray-800', className)}
    {...props}
  />
));
CommandGroup.displayName = 'CommandGroup';

// ไอเท็ม
const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none',
      'hover:bg-gray-100 aria-selected:bg-gray-100 aria-selected:text-gray-900',
      'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
      className
    )}
    {...props}
  />
));
CommandItem.displayName = 'CommandItem';

// เส้นแบ่ง
const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-gray-200', className)}
    {...props}
  />
));
CommandSeparator.displayName = 'CommandSeparator';

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
};
