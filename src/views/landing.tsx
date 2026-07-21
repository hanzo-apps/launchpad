import { useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, H1, Paragraph, Text, Input, Button, Circle } from '@hanzo/gui'
import { Aurora } from '../components/aurora'
import { Countdown } from '../components/countdown'
import { Counter } from '../components/counter'
import { BRAND, EYEBROW, SUBHEAD, emailValid, stashPending, type Signup } from '../lib/waitlist'

/**
 * The launch landing — the pre-auth hero. Dark, motion-rich: a drifting aurora,
 * a live countdown, an easing signup counter, and ONE call to action (email +
 * button). Claiming a spot stashes the email and starts Hanzo PKCE; the row is
 * written org-scoped once the visitor lands back authenticated (views/admin.tsx).
 */
export function Landing() {
  const { login } = useIam()
  // Live count from Base. Signed out this is honestly empty (Base is org-scoped),
  // so we lead with "Be the first" rather than a fabricated number.
  const { data } = useQuery<Signup>('signups', { sort: '-created', realtime: false })
  const count = data.length

  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const ready = emailValid(email.trim())

  function join() {
    if (!ready || busy) return
    setBusy(true)
    stashPending(email.trim().toLowerCase())
    login()
  }

  return (
    <YStack
      flex={1}
      minHeight="100vh"
      backgroundColor="$background"
      overflow="hidden"
      alignItems="center"
      justifyContent="center"
      padding="$6"
    >
      <Aurora />

      <YStack className="wl-rise" zIndex={1} width="100%" maxWidth={660} alignItems="center" gap="$6">
        <XStack
          className="wl-breathe"
          alignItems="center"
          gap="$2"
          paddingVertical={7}
          paddingHorizontal={14}
          borderRadius={999}
          borderWidth={1}
          borderColor="rgba(255,255,255,0.14)"
          backgroundColor="rgba(255,255,255,0.06)"
        >
          <Circle size={7} backgroundColor="#39e0a0" />
          <Text fontSize={12} letterSpacing={1} opacity={0.85} color="$color">
            {EYEBROW}
          </Text>
        </XStack>

        <YStack alignItems="center" gap="$3">
          <H1 textAlign="center" fontSize={72} lineHeight={74} fontWeight="900" color="$color">
            {BRAND}
          </H1>
          <Paragraph textAlign="center" fontSize={18} lineHeight={26} opacity={0.62} maxWidth={460} color="$color">
            {SUBHEAD}
          </Paragraph>
        </YStack>

        <Countdown />

        <XStack alignItems="center" gap="$2" minHeight={26}>
          {count > 0 ? (
            <>
              <Counter value={count} size={18} className="wl-mono" />
              <Text fontSize={15} opacity={0.6} color="$color">
                already in line
              </Text>
            </>
          ) : (
            <Text fontSize={15} opacity={0.6} color="$color">
              Be the first in line.
            </Text>
          )}
        </XStack>

        <YStack width="100%" maxWidth={440} gap="$2">
          <XStack gap="$2" width="100%">
            <Input
              flex={1}
              size="$4"
              value={email}
              placeholder="you@company.com"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              onSubmitEditing={join}
            />
            <Button className="wl-cta" size="$4" theme="active" disabled={busy || !ready} onPress={join}>
              {busy ? 'Redirecting…' : 'Get early access'}
            </Button>
          </XStack>
          <Text fontSize={12} textAlign="center" opacity={0.4} color="$color">
            Secured with your Hanzo account. No spam — one email at launch.
          </Text>
        </YStack>

        <Button size="$2" chromeless opacity={0.5} onPress={() => login()}>
          Already have access? Sign in
        </Button>
      </YStack>
    </YStack>
  )
}
