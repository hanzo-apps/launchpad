import { useEffect, useRef, useState } from 'react'
import { Text } from '@hanzo/gui'

/**
 * A number that eases up to `value` whenever it changes (cubic ease-out over
 * ~0.9s via requestAnimationFrame). Real motion, no animation driver required —
 * it animates the live signup total on the landing and the admin dashboard.
 */
export function Counter({ value, size = 48, className }: { value: number; size?: number; className?: string }) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const from = fromRef.current
    const to = value
    if (from === to) return

    const start = performance.now()
    const duration = 900

    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(from + (to - from) * eased))
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value])

  return (
    <Text className={className} fontSize={size} fontWeight="800" color="$color" lineHeight={size}>
      {display.toLocaleString()}
    </Text>
  )
}
