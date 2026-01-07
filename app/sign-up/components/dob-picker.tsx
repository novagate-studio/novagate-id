'use client'

import { ChevronDownIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import moment from 'moment'
import { vi } from 'date-fns/locale'
interface DobPickerProps {
  value?: Date | null
  onChange?: (date: Date | undefined) => void
}

export function DobPicker({ value, onChange }: DobPickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant='outline' id='date' className='w-full justify-between font-normal'>
            {value ? moment(value).format('DD/MM/YYYY') : 'Chọn ngày sinh'}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
          <Calendar
            mode='single'
            selected={value || undefined}
            captionLayout='dropdown'
            locale={vi}
            onSelect={(date) => {
              onChange?.(date)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
