import { YStack, Circle } from '@hanzo/gui'

/**
 * The drifting glow behind the hero. Pure decoration: three big blurred discs
 * that float on CSS keyframes (defined in index.html) applied via `className` —
 * the one web escape hatch @hanzo/gui (Tamagui) exposes for effects its style
 * props don't cover (blur, keyframe motion). No second UI kit, no Tailwind.
 */
export function Aurora() {
  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      overflow="hidden"
      pointerEvents="none"
    >
      <Circle className="wl-aurora wl-aurora-a" size={560} backgroundColor="#6d5efc" position="absolute" top={-180} left={-120} opacity={0.55} />
      <Circle className="wl-aurora wl-aurora-b" size={480} backgroundColor="#17b6d8" position="absolute" top={20} right={-150} opacity={0.4} />
      <Circle className="wl-aurora wl-aurora-c" size={440} backgroundColor="#e0489b" position="absolute" bottom={-200} left={220} opacity={0.34} />
    </YStack>
  )
}
