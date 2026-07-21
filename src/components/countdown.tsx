import { useEffect, useState } from 'react'
import { XStack, YStack, Text } from '@hanzo/gui'
import { LAUNCH_AT } from '../env'
import { splitDuration, pad2 } from '../lib/waitlist'

/** One glass cell: a big monospaced number over a small caps label. */
function Cell({ value, label }: { value: number; label: string }) {
  return (
    <YStack
      alignItems="center"
      justifyContent="center"
      gap="$2"
      minWidth={82}
      paddingVertical={16}
      paddingHorizontal={12}
      borderRadius={18}
      borderWidth={1}
      borderColor="rgba(255,255,255,0.10)"
      backgroundColor="rgba(255,255,255,0.04)"
    >
      <Text className="wl-mono" fontSize={40} fontWeight="800" color="$color" lineHeight={42}>
        {pad2(value)}
      </Text>
      <Text fontSize={10} letterSpacing={2} opacity={0.5} color="$color">
        {label}
      </Text>
    </YStack>
  )
}

/**
 * The live countdown to LAUNCH_AT. A single 1s interval re-reads the clock; the
 * seconds cell ticking is the hero's primary, genuine motion. `compact` renders
 * an inline `29d 04:12:33` string for the admin header.
 */
export function Countdown({ compact = false }: { compact?: boolean }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const t = splitDuration(LAUNCH_AT.getTime() - now)

  if (compact) {
    return (
      <Text className="wl-mono" fontSize={14} opacity={0.7} color="$color">
        {t.done ? 'Launching now' : `${t.days}d ${pad2(t.hours)}:${pad2(t.minutes)}:${pad2(t.seconds)}`}
      </Text>
    )
  }

  return (
    <XStack gap="$3" justifyContent="center" flexWrap="wrap">
      <Cell value={t.days} label="DAYS" />
      <Cell value={t.hours} label="HRS" />
      <Cell value={t.minutes} label="MIN" />
      <Cell value={t.seconds} label="SEC" />
    </XStack>
  )
}
