"use client";

type AILoaderProps = {
  text?: string;
  compact?: boolean;
};

export function AILoader({ text = "AI Grading", compact = false }: AILoaderProps) {
  const letters = text.split("");

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="inline-flex size-4 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
        <span className="text-xs text-stone-600">{text}</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/50 px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-white">
          <span className="absolute inset-0 rounded-full border-2 border-sky-200" />
          <span className="size-6 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-stone-800">
            {letters.map((letter, index) => (
              <span
                key={`${letter}-${index}`}
                className="inline-block animate-[ai-loader-letter_1.4s_ease-in-out_infinite]"
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                {letter}
              </span>
            ))}
          </p>
          <p className="text-xs text-stone-500">
            Submission is queued and the model is preparing the rubric breakdown.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes ai-loader-letter {
          0%,
          100% {
            opacity: 0.5;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-1px);
          }
        }
      `}</style>
    </div>
  );
}
