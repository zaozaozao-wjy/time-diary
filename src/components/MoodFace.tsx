import type { MoodType } from "../types";

const moodColors: Record<MoodType, { face: string; ink: string }> = {
  happy: { face: "#FFF0C9", ink: "#9A7B4D" },
  calm: { face: "#E5F0E3", ink: "#5F7A68" },
  moved: { face: "#F8E7E9", ink: "#B8737D" },
  tired: { face: "#F1E9DC", ink: "#826E5C" },
  sad: { face: "#E8EFF5", ink: "#72869D" },
  excited: { face: "#FBE9D9", ink: "#B8683D" },
};

export function MoodFace({
  mood,
  size = 18,
  className,
}: {
  mood: MoodType;
  size?: number;
  className?: string;
}) {
  const colors = moodColors[mood];
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.25" fill={colors.face} stroke={colors.ink} strokeWidth="1.35" />

      {mood === "happy" && (
        <>
          <circle cx="8.6" cy="10" r="1.15" fill={colors.ink} />
          <circle cx="15.4" cy="10" r="1.15" fill={colors.ink} />
          <path d="M7.7 13.2c1.4 2.2 4.4 3 7.4.3" stroke={colors.ink} strokeWidth="1.45" strokeLinecap="round" />
        </>
      )}

      {mood === "calm" && (
        <>
          <path d="M6.9 10.4c.8.7 1.7.7 2.5 0" stroke={colors.ink} strokeWidth="1.35" strokeLinecap="round" />
          <path d="M14.6 10.4c.8.7 1.7.7 2.5 0" stroke={colors.ink} strokeWidth="1.35" strokeLinecap="round" />
          <path d="M9.5 15c1.6 1 3.4 1 5 0" stroke={colors.ink} strokeWidth="1.35" strokeLinecap="round" />
        </>
      )}

      {mood === "moved" && (
        <>
          <path
            d="M8.2 11.2c-.2-1-1.5-1.5-2.1-.6-.5.8.2 1.8 1.1 2.5l1 .8 1.1-.8c.9-.7 1.6-1.7 1.1-2.5-.6-.9-1.9-.4-2.2.6Z"
            fill={colors.ink}
          />
          <path
            d="M15.9 11.2c-.2-1-1.5-1.5-2.1-.6-.5.8.2 1.8 1.1 2.5l1 .8 1.1-.8c.9-.7 1.6-1.7 1.1-2.5-.6-.9-1.9-.4-2.2.6Z"
            fill={colors.ink}
          />
          <path d="M9.8 15.2c1.5 1.1 3 1.1 4.5 0" stroke={colors.ink} strokeWidth="1.35" strokeLinecap="round" />
        </>
      )}

      {mood === "tired" && (
        <>
          <path d="M7 10.2h3" stroke={colors.ink} strokeWidth="1.45" strokeLinecap="round" />
          <path d="M14 10.2h3" stroke={colors.ink} strokeWidth="1.45" strokeLinecap="round" />
          <path d="M9.5 15.2c1.5-.8 3.5-.8 5 0" stroke={colors.ink} strokeWidth="1.35" strokeLinecap="round" />
        </>
      )}

      {mood === "sad" && (
        <>
          <path d="m7.5 7.8 2.5 1" stroke={colors.ink} strokeWidth="1.25" strokeLinecap="round" />
          <path d="m16.5 7.8-2.5 1" stroke={colors.ink} strokeWidth="1.25" strokeLinecap="round" />
          <circle cx="8.7" cy="11" r="1" fill={colors.ink} />
          <circle cx="15.3" cy="11" r="1" fill={colors.ink} />
          <path d="M8.6 16.1c1.8-1.8 5-1.8 6.8 0" stroke={colors.ink} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M18.6 13.8c.1 1.2-.8 2.1-1.5 2.1.4-1 .5-1.5 1.5-2.1Z" fill="#79A5BF" />
        </>
      )}

      {mood === "excited" && (
        <>
          <path d="m7.9 8.3.6 1.25 1.4.2-.98.97.23 1.38-1.25-.68-1.24.68.23-1.38-1-.97 1.4-.2Z" fill={colors.ink} />
          <path d="m16.1 8.3.6 1.25 1.4.2-.98.97.23 1.38-1.25-.68-1.24.68.23-1.38-1-.97 1.4-.2Z" fill={colors.ink} />
          <ellipse cx="12" cy="15.1" rx="2.3" ry="2.65" fill={colors.ink} opacity=".88" />
          <path d="M8.3 13.4c-1.6 1.4-2.4 2.7-1.2 3.4 1 .5 2.1-.3 2.8-1.2M15.7 13.4c1.6 1.4 2.4 2.7 1.2 3.4-1 .5-2.1-.3-2.8-1.2" stroke={colors.ink} strokeWidth="1.1" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
