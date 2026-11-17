export function Subtitle({
  text,
  speaker,
}: {
  text: string;
  speaker?: string;
}) {
  const match = text.match(/^(AION|An|Cô Vân|Nhà nghiên cứu):\s*(.*)$/s);
  const name = speaker ?? match?.[1];
  const line = match?.[2] ?? text;
  return (
    <div
      className="subtitle"
      data-kind={/^\[.*\]$/s.test(text) ? "ambience" : "dialogue"}
      aria-live="polite"
    >
      {name && (
        <small className="subtitle-speaker future-speaker">{name}</small>
      )}
      <p key={line}>{line}</p>
    </div>
  );
}
export function SoundIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 5 6 9H3v6h3l5 4Z" />
      {muted ? (
        <path d="m16 9 5 6m0-6-5 6" />
      ) : (
        <>
          <path d="M15 8a6 6 0 0 1 0 8" />
          <path d="M18 5a10 10 0 0 1 0 14" />
        </>
      )}
    </svg>
  );
}
export function PauseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M8 6v12M16 6v12" />
    </svg>
  );
}
