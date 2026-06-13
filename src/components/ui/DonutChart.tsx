interface Segment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: Segment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}

export default function DonutChart({ segments, size = 160, thickness = 20, centerLabel, centerValue }: DonutChartProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* bg circle */}
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={thickness} />
          {segments.map((seg, i) => {
            const pct = total > 0 ? seg.value / total : 0;
            const dashLength = circumference * pct;
            const offset = circumference * accumulated;
            accumulated += pct;
            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && <span className="text-xl font-bold text-white">{centerValue}</span>}
            {centerLabel && <span className="text-[10px] text-surface-400">{centerLabel}</span>}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-[11px] text-surface-400">{seg.label}</span>
            <span className="text-[11px] text-surface-500">({seg.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
