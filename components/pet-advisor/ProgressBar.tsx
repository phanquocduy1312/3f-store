interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className="w-full space-y-2 mb-6">
      <div className="flex justify-between items-center text-xs font-semibold text-ink-soft">
        <span>Tiến trình</span>
        <span>
          Bước {current}/{total}
        </span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-forest rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
