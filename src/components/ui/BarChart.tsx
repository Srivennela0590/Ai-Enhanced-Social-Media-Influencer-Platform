import { useState } from 'react';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: DataPoint[];
  height?: number;
  title?: string;
  subtitle?: string;
  gradient?: [string, string];
}

export default function BarChart({ data, height = 200, title, subtitle, gradient = ['#a855f7', '#ec4899'] }: BarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h4 className="text-sm font-semibold text-white">{title}</h4>}
          {subtitle && <p className="text-xs text-surface-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          const isHovered = hovered === i;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1 group"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="relative w-full flex justify-center">
                {isHovered && (
                  <div className="absolute -top-7 bg-surface-800 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap z-10 border border-white/10">
                    {d.value.toLocaleString()}
                  </div>
                )}
                <div
                  className="w-full max-w-[32px] rounded-t-md transition-all duration-300"
                  style={{
                    height: `${Math.max(pct, 3)}%`,
                    background: d.color || `linear-gradient(to top, ${gradient[0]}, ${gradient[1]})`,
                    opacity: isHovered ? 1 : 0.75,
                    transform: isHovered ? 'scaleY(1.02)' : 'scaleY(1)',
                    transformOrigin: 'bottom',
                  }}
                />
              </div>
              <span className="text-[9px] text-surface-500 truncate w-full text-center">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
