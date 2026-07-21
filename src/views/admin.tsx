import { useEffect, useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { useQuery, useMutation } from '@hanzo/base/react'
import { YStack, XStack, H1, Paragraph, Text, Input, Button, Spinner, Separator } from '@hanzo/gui'
import { Countdown } from '../components/countdown'
import { Counter } from '../components/counter'
import { BRAND, emailValid, formatJoined, takePending, type Signup } from '../lib/waitlist'

/**
 * The admin dashboard — signed-in surface over the same org-scoped `signups`
 * collection. Shows the running total (easing counter) + countdown, folds in the
 * email a visitor claimed before signing in, and lists / filters / prunes rows.
 * The read/write pattern mirrors the starter: useQuery + useMutation, refetch
 * after each write, all carrying the IAM token wired in providers.tsx.
 */
export function Admin() {
  const { user, logout } = useIam()
  const who = user?.displayName || user?.name || user?.email || 'you'

  const { data, isLoading, error, refetch } = useQuery<Signup>('signups', {
    sort: '-created',
    realtime: false,
  })
  const create = useMutation('signups', 'create')
  const remove = useMutation('signups', 'delete')

  const [addEmail, setAddEmail] = useState('')
  const [q, setQ] = useState('')
  const [joined, setJoined] = useState<string | null>(null)

  // Fold in the spot claimed on the landing page. `takePending` reads-and-clears
  // so this creates exactly one row even under StrictMode's double-run effects.
  useEffect(() => {
    const pending = takePending()
    if (!pending) return
    setJoined(pending)
    create.mutate({ email: pending }).then(() => refetch())

  }, [])

  async function add() {
    const email = addEmail.trim().toLowerCase()
    if (!emailValid(email) || create.isLoading) return
    await create.mutate({ email })
    setAddEmail('')
    await refetch()
  }

  async function del(id: string) {
    await remove.mutate({ id })
    await refetch()
  }

  const needle = q.trim().toLowerCase()
  const rows = needle ? data.filter((s) => s.email.toLowerCase().includes(needle)) : data
  const ready = emailValid(addEmail.trim())

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor="$background">
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingVertical="$3"
        paddingHorizontal="$4"
        borderBottomWidth={1}
        borderColor="$borderColor"
      >
        <XStack alignItems="center" gap="$3">
          <H1 fontSize="$7">{BRAND}</H1>
          <Text fontSize={13} opacity={0.4} color="$color">
            waitlist
          </Text>
        </XStack>
        <Button size="$3" onPress={() => logout()}>
          Sign out
        </Button>
      </XStack>

      <YStack padding="$4" gap="$4" width="100%" maxWidth={760} alignSelf="center">
        {joined ? (
          <XStack
            alignItems="center"
            gap="$2"
            paddingVertical="$3"
            paddingHorizontal="$4"
            borderRadius="$4"
            borderWidth={1}
            borderColor="rgba(57,224,160,0.35)"
            backgroundColor="rgba(57,224,160,0.10)"
          >
            <Text color="$color" fontSize={14}>
              You're on the list — <Text fontWeight="800">{joined}</Text> is locked in.
            </Text>
          </XStack>
        ) : null}

        <XStack
          alignItems="center"
          justifyContent="space-between"
          gap="$4"
          flexWrap="wrap"
          paddingVertical="$4"
          paddingHorizontal="$4"
          borderRadius="$6"
          borderWidth={1}
          borderColor="$borderColor"
          backgroundColor="rgba(255,255,255,0.02)"
        >
          <YStack gap="$1">
            <Counter value={data.length} size={44} className="wl-mono" />
            <Text fontSize={13} letterSpacing={1} opacity={0.5} color="$color">
              TOTAL SIGNUPS
            </Text>
          </YStack>
          <YStack gap="$1" alignItems="flex-end">
            <Countdown compact />
            <Text fontSize={13} letterSpacing={1} opacity={0.5} color="$color">
              UNTIL LAUNCH
            </Text>
          </YStack>
        </XStack>

        <XStack gap="$2">
          <Input
            flex={1}
            value={addEmail}
            placeholder="Add a signup by email…"
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setAddEmail}
            onSubmitEditing={add}
          />
          <Button theme="active" disabled={create.isLoading || !ready} onPress={add}>
            Add
          </Button>
        </XStack>
        {create.error ? <Paragraph color="$red10">{create.error.message}</Paragraph> : null}

        <XStack alignItems="center" justifyContent="space-between" gap="$3">
          <Input flex={1} value={q} placeholder="Filter signups…" onChangeText={setQ} />
          <Text fontSize={13} opacity={0.5} color="$color">
            {rows.length} of {data.length}
          </Text>
        </XStack>

        <Separator />

        {isLoading ? (
          <XStack gap="$2" alignItems="center" opacity={0.6}>
            <Spinner /> <Text color="$color">Loading signups…</Text>
          </XStack>
        ) : error ? (
          <Paragraph color="$red10">
            Couldn't reach Base ({error.message}). Confirm VITE_HANZO_BASE_URL and that you're
            signed in.
          </Paragraph>
        ) : data.length === 0 ? (
          <Paragraph opacity={0.6} color="$color">
            No signups yet — share your launch page, or add one above.
          </Paragraph>
        ) : rows.length === 0 ? (
          <Paragraph opacity={0.6} color="$color">
            No signups match “{q}”.
          </Paragraph>
        ) : (
          <YStack gap="$2">
            {rows.map((s) => (
              <XStack
                key={s.id}
                alignItems="center"
                justifyContent="space-between"
                gap="$3"
                paddingVertical="$3"
                paddingHorizontal="$3"
                borderRadius="$4"
                borderWidth={1}
                borderColor="$borderColor"
                backgroundColor="rgba(255,255,255,0.02)"
              >
                <YStack flex={1} gap="$1">
                  <Text fontSize={15} color="$color">
                    {s.email}
                  </Text>
                  <Text fontSize={12} opacity={0.45} color="$color">
                    Joined {formatJoined(s.created)}
                  </Text>
                </YStack>
                <Button size="$2" chromeless disabled={remove.isLoading} onPress={() => del(s.id)}>
                  Remove
                </Button>
              </XStack>
            ))}
          </YStack>
        )}

        <Paragraph fontSize={12} opacity={0.35} color="$color">
          Signed in as {who} · signups are private to your org in Hanzo Base.
        </Paragraph>
      </YStack>
    </YStack>
  )
}
