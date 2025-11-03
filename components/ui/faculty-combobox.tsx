'use client';
import { useState, useMemo } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

type Props = {
  name: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  error?: string;
};

export default function FacultyCombobox({
  name,
  label = 'คณะ',
  placeholder = 'พิมพ์เพื่อค้นหา…',
  value,
  onChange,
  options,
  error,
}: Props) {
  const [open, setOpen] = useState(false);

  // ทำชุดตัวเลือกแบบ unique เผื่อมีซ้ำ
  const items = useMemo(() => Array.from(new Set(options)), [options]);

  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>

        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-invalid={!!error}
                    name={name}
                    data-name={name}
                    id={`${name}-trigger`}
                    tabIndex={0}
                    className={cn(
                    'relative w-full h-10 rounded-lg bg-white text-sm shadow-sm border px-4 pr-10',
                    'flex items-center justify-start text-left',
                    error
                        ? 'border-red-500 focus-visible:border-red-600 focus-visible:ring-1 focus-visible:ring-red-600'
                        : 'border-gray-300 hover:border-gray-400 focus-visible:border-gray-600 focus-visible:ring-1 focus-visible:ring-gray-600',
                    'data-[state=open]:border-gray-600 data-[state=open]:ring-1 data-[state=open]:ring-gray-600',
                    'outline-none'
                    )}
                >
                    {/* กินพื้นที่แล้วจัดข้อความชิดซ้าย */}
                    <span className={cn('flex-1 truncate text-left', value ? 'text-gray-900' : 'text-gray-400')}>
                    {value || 'เลือกคณะ'}
                    </span>

                    {/* ไอคอนขวาแบบ absolute */}
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="p-0" align="start">
            <Command>
            <CommandInput placeholder={placeholder} />
            <CommandEmpty>ไม่พบคณะที่ค้นหา</CommandEmpty>
            <CommandList className="max-h-64 overflow-y-auto scrollbar-kku">
                <CommandGroup>
                {items.map(opt => (
                    <CommandItem key={opt} value={opt} onSelect={() => { onChange(opt); setOpen(false); }}>
                    <Check className={cn('mr-2 h-4 w-4', value === opt ? 'opacity-100' : 'opacity-0')} />
                    {opt}
                    </CommandItem>
                ))}
                </CommandGroup>
            </CommandList>
            </Command>
            </PopoverContent>
      </Popover>

      {error && <p className="mt-1 mb-3 text-xs text-red-600">{error}</p>}
    </div>
  );
}
