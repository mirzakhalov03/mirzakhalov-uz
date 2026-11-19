/**
 * Emoji as images, never as text.
 *
 * A typed emoji renders in whatever font the device ships — Segoe on Windows,
 * Noto on Android, Apple's on a Mac — so the same page looks like three
 * different sites. These are Microsoft's Fluent Emoji 3D (MIT, licence in
 * public/emoji/), self-hosted so every visitor sees the same glossy set.
 * Apple's own artwork is licensed for Apple devices only, so it cannot be
 * shipped here.
 *
 * Adding one: drop the 3D PNG from github.com/microsoft/fluentui-emoji into
 * public/emoji/ and add a line below.
 */
const EMOJI = {
  wave: { file: 'waving-hand.png', char: '👋' },
  grin: { file: 'grinning-smiling-eyes.png', char: '😄' },
  ok: { file: 'ok-hand.png', char: '👌' },
} as const;

export type EmojiName = keyof typeof EMOJI;

/** Decorative by default. Pass `label` when the emoji carries meaning on its own. */
export function Emoji({
  name,
  label,
  className = 'size-3',
}: {
  name: EmojiName;
  label?: string;
  className?: string;
}) {
  const { file } = EMOJI[name];
  return (
    <img
      src={`/emoji/${file}`}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      width={256}
      height={256}
      decoding="async"
      draggable={false}
      className={`inline-block shrink-0 select-none ${className}`}
    />
  );
}
