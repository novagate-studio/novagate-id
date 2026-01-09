'use client'

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import * as React from 'react'
import { CSSProperties } from 'react'

interface DobPickerProps {
  value?: Date | null
  onChange?: (date: Date | undefined) => void
}

const styles: Record<string, CSSProperties> = {
  container: {
    position: 'relative',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '2.5rem',
    borderRadius: '0.375rem',
    border: '1px solid #e4e4e7',
    backgroundColor: 'transparent',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    fontWeight: 400,
    cursor: 'pointer',
    outline: 'none',
  },
  popover: {
    position: 'absolute',
    zIndex: 50,
    marginTop: '0.25rem',
    backgroundColor: '#ffffff',
    borderRadius: '0.375rem',
    border: '1px solid #e4e4e7',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    padding: '0.75rem',
  },
  calendarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  navButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.75rem',
    height: '1.75rem',
    borderRadius: '0.375rem',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  dropdownsContainer: {
    display: 'flex',
    gap: '0.5rem',
  },
  dropdown: {
    padding: '0.25rem 0.5rem',
    borderRadius: '0.375rem',
    border: '1px solid #e4e4e7',
    fontSize: '0.875rem',
    cursor: 'pointer',
    outline: 'none',
    backgroundColor: '#ffffff',
  },
  calendarGrid: {
    borderCollapse: 'collapse',
  },
  weekdayHeader: {
    fontSize: '0.75rem',
    fontWeight: 400,
    color: '#71717a',
    width: '36px',
    textAlign: 'center',
    padding: '0.25rem',
  },
  dayCell: {
    textAlign: 'center',
    padding: 0,
  },
  dayButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    fontSize: '0.875rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
  },
  dayButtonDefault: {
    backgroundColor: 'transparent',
    color: '#18181b',
  },
  dayButtonSelected: {
    backgroundColor: '#18181b',
    color: '#fafafa',
  },
  dayButtonOutside: {
    color: '#a1a1aa',
    backgroundColor: 'transparent',
  },
  dayButtonToday: {
    fontWeight: 700,
  },
}

const WEEKDAYS_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const MONTHS_VI = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
]

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // Convert Sunday=0 to Monday=0 format
}

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export function DobPicker({ value, onChange }: DobPickerProps) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const today = new Date()
  const [viewYear, setViewYear] = React.useState(value?.getFullYear() || today.getFullYear() - 18)
  const [viewMonth, setViewMonth] = React.useState(value?.getMonth() || today.getMonth())

  // Generate year options (1900 to current year)
  const currentYear = today.getFullYear()
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => 1900 + i).reverse()

  // Close popover when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const handleSelectDate = (day: number) => {
    const selectedDate = new Date(viewYear, viewMonth, day)
    onChange?.(selectedDate)
    setOpen(false)
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth)
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
    const daysInPrevMonth = getDaysInMonth(viewYear, viewMonth - 1)

    const days: React.ReactNode[] = []
    const weeks: React.ReactNode[] = []

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      days.push(
        <td key={`prev-${day}`} style={styles.dayCell}>
          <button
            type='button'
            style={{ ...styles.dayButton, ...styles.dayButtonOutside }}
            onClick={() => {
              handlePrevMonth()
              setTimeout(() => handleSelectDate(day), 0)
            }}>
            {day}
          </button>
        </td>
      )
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        value && value.getDate() === day && value.getMonth() === viewMonth && value.getFullYear() === viewYear
      const isToday = today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear

      days.push(
        <td key={`curr-${day}`} style={styles.dayCell}>
          <button
            type='button'
            style={{
              ...styles.dayButton,
              ...(isSelected ? styles.dayButtonSelected : styles.dayButtonDefault),
              ...(isToday && !isSelected ? styles.dayButtonToday : {}),
            }}
            onClick={() => handleSelectDate(day)}>
            {day}
          </button>
        </td>
      )
    }

    // Next month days
    const remainingCells = 42 - days.length // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <td key={`next-${day}`} style={styles.dayCell}>
          <button
            type='button'
            style={{ ...styles.dayButton, ...styles.dayButtonOutside }}
            onClick={() => {
              handleNextMonth()
              setTimeout(() => handleSelectDate(day), 0)
            }}>
            {day}
          </button>
        </td>
      )
    }

    // Group into weeks
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(<tr key={`week-${i}`}>{days.slice(i, i + 7)}</tr>)
    }

    return weeks
  }

  return (
    <div ref={containerRef} style={styles.container}>
      <button type='button' style={styles.button} onClick={() => setOpen(!open)}>
        <span>{value ? formatDate(value) : 'Chọn ngày sinh'}</span>
        <ChevronDownIcon size={16} />
      </button>

      {open && (
        <div style={styles.popover}>
          <div style={styles.calendarHeader}>
            <button type='button' style={styles.navButton} onClick={handlePrevMonth}>
              <ChevronLeftIcon size={16} />
            </button>

            <div style={styles.dropdownsContainer}>
              <select style={styles.dropdown} value={viewMonth} onChange={(e) => setViewMonth(Number(e.target.value))}>
                {MONTHS_VI.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>

              <select style={styles.dropdown} value={viewYear} onChange={(e) => setViewYear(Number(e.target.value))}>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button type='button' style={styles.navButton} onClick={handleNextMonth}>
              <ChevronRightIcon size={16} />
            </button>
          </div>

          <table style={styles.calendarGrid}>
            <thead>
              <tr>
                {WEEKDAYS_VI.map((day) => (
                  <th key={day} style={styles.weekdayHeader}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{renderCalendarDays()}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}
