import React, { useState } from 'react';

interface BarDatum {
  label: string;
  value: number;
  secondaryValue?: number;
  highlight?: boolean;
  color?: string;
}

/**
 * Clean SVG Bar Chart with positive & negative value support,
 * baseline zero line, and responsive coordinate mapping.
 */
export const SimpleBarChart: React.FC<{
  title: string;
  subtitle?: string;
  data: BarDatum[];
  height?: number;
  unit?: string;
  isCurrency?: boolean;
}> = ({ title, subtitle, data, height = 180, unit = '', isCurrency = true }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const values = data.map(d => d.value);
  const minVal = Math.min(0, ...values);
  const maxVal = Math.max(0, ...values);
  const range = maxVal - minVal || 1;

  const chartHeight = height - 40;
  const paddingBottom = 22;
  const paddingTop = 12;
  const usableHeight = chartHeight - paddingBottom - paddingTop;

  // Zero Y position
  const zeroY = paddingTop + ((maxVal - 0) / range) * usableHeight;

  const formatVal = (v: number) => {
    if (isCurrency) {
      return `${Math.round(v).toLocaleString('fr-FR')} €`;
    }
    return `${Math.round(v).toLocaleString('fr-FR')} ${unit}`;
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-slate-200 tracking-wide">{title}</h4>
        {subtitle && <span className="text-[10px] text-slate-400 font-mono">{subtitle}</span>}
      </div>

      <div className="relative w-full" style={{ height: `${chartHeight}px` }}>
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
          {/* Zero line */}
          <line
            x1="0"
            y1={zeroY}
            x2="100%"
            y2={zeroY}
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Bars */}
          {data.map((d, i) => {
            const barWidthPercent = 65 / data.length;
            const slotWidthPercent = 100 / data.length;
            const xPercent = i * slotWidthPercent + (slotWidthPercent - barWidthPercent) / 2;

            const isNegative = d.value < 0;
            const barH = (Math.abs(d.value) / range) * usableHeight;
            const yPos = isNegative ? zeroY : zeroY - barH;

            const isHovered = hoverIndex === i;
            let fillColor = d.color;
            if (!fillColor) {
              if (d.highlight) {
                fillColor = isNegative ? '#ef4444' : '#f97316';
              } else {
                fillColor = isNegative ? '#dc2626' : '#6366f1';
              }
            }

            return (
              <g
                key={i}
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <rect
                  x={`${xPercent}%`}
                  y={yPos}
                  width={`${barWidthPercent}%`}
                  height={Math.max(2, barH)}
                  fill={fillColor}
                  rx="2"
                  opacity={hoverIndex !== null && !isHovered ? 0.45 : 0.9}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>

        {/* Labels at bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
          {data.map((d, i) => (
            <div
              key={i}
              className={`text-[10px] font-mono text-center flex-1 truncate ${
                d.highlight ? 'text-amber-400 font-semibold' : 'text-slate-400'
              }`}
            >
              {d.label}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hoverIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none -top-2 bg-slate-950 border border-slate-700 text-white text-[11px] rounded px-2 py-1 shadow-lg font-mono -translate-x-1/2 whitespace-nowrap"
            style={{
              left: `${(hoverIndex + 0.5) * (100 / data.length)}%`,
            }}
          >
            <div className="font-semibold text-slate-300">{data[hoverIndex].label}</div>
            <div className={data[hoverIndex].value < 0 ? 'text-red-400' : 'text-emerald-400'}>
              {formatVal(data[hoverIndex].value)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Bar chart with Line overlay (e.g. Sales with Market Average line)
 */
export const BarLineChart: React.FC<{
  title: string;
  data: { label: string; bar: number; line: number }[];
  barName: string;
  lineName: string;
  isCurrency?: boolean;
  unit?: string;
  height?: number;
}> = ({ title, data, barName, lineName, isCurrency = true, unit = '', height = 180 }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const allVals = data.flatMap(d => [d.bar, d.line]);
  const minVal = Math.min(0, ...allVals);
  const maxVal = Math.max(0, ...allVals) * 1.08;
  const range = maxVal - minVal || 1;

  const chartHeight = height - 40;
  const paddingBottom = 22;
  const paddingTop = 14;
  const usableHeight = chartHeight - paddingBottom - paddingTop;

  const getY = (val: number) => paddingTop + ((maxVal - val) / range) * usableHeight;

  // Generate SVG path for line
  const linePoints = data.map((d, i) => {
    const x = ((i + 0.5) / data.length) * 100;
    const y = getY(d.line);
    return `${x},${y}`;
  });
  const pathD = `M ${linePoints.join(' L ')}`;

  const formatVal = (v: number) => {
    if (isCurrency) return `${Math.round(v).toLocaleString('fr-FR')} €`;
    return `${v.toLocaleString('fr-FR')} ${unit}`;
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-slate-200 tracking-wide">{title}</h4>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-xs inline-block"></span>
            <span className="text-slate-400">{barName}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-red-400 inline-block"></span>
            <span className="text-slate-400">{lineName}</span>
          </div>
        </div>
      </div>

      <div className="relative w-full" style={{ height: `${chartHeight}px` }}>
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 100 ${chartHeight}`}>
          {/* Zero baseline */}
          <line x1="0" y1={getY(0)} x2="100" y2={getY(0)} stroke="#334155" strokeWidth="0.5" />

          {/* Bars */}
          {data.map((d, i) => {
            const barW = 45 / data.length;
            const x = (i + 0.5) * (100 / data.length) - barW / 2;
            const yZero = getY(0);
            const yBar = getY(d.bar);
            const h = Math.abs(yZero - yBar);
            const topY = d.bar >= 0 ? yBar : yZero;

            return (
              <rect
                key={i}
                x={x}
                y={topY}
                width={barW}
                height={Math.max(1, h)}
                fill={d.bar < 0 ? '#ef4444' : '#6366f1'}
                opacity={hoverIndex === null || hoverIndex === i ? 0.85 : 0.4}
                rx="0.5"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            );
          })}

          {/* Line */}
          <path d={pathD} fill="none" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Line dots */}
          {data.map((d, i) => {
            const x = ((i + 0.5) / data.length) * 100;
            const y = getY(d.line);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1.8"
                fill="#ef4444"
                stroke="#0f172a"
                strokeWidth="0.8"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            );
          })}
        </svg>

        {/* Labels at bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
          {data.map((d, i) => (
            <div key={i} className="text-[10px] font-mono text-center flex-1 text-slate-400">
              {d.label}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hoverIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none -top-2 bg-slate-950 border border-slate-700 text-white text-[11px] rounded px-2.5 py-1.5 shadow-lg font-mono -translate-x-1/2"
            style={{
              left: `${(hoverIndex + 0.5) * (100 / data.length)}%`,
            }}
          >
            <div className="font-semibold text-slate-300">{data[hoverIndex].label}</div>
            <div className="text-indigo-400 text-[10px]">{barName}: {formatVal(data[hoverIndex].bar)}</div>
            <div className="text-red-400 text-[10px]">{lineName}: {formatVal(data[hoverIndex].line)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Grouped Bar Chart (e.g. Product A vs Product B, or Inflow vs Outflow)
 */
export const GroupedBarChart: React.FC<{
  title: string;
  data: { label: string; v1: number; v2: number }[];
  name1: string;
  name2: string;
  color1?: string;
  color2?: string;
  isCurrency?: boolean;
  unit?: string;
  height?: number;
}> = ({
  title,
  data,
  name1,
  name2,
  color1 = '#818cf8',
  color2 = '#ef4444',
  isCurrency = false,
  unit = '',
  height = 180,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.flatMap(d => [d.v1, d.v2])) * 1.1 || 1;
  const chartHeight = height - 40;
  const paddingBottom = 22;
  const paddingTop = 12;
  const usableHeight = chartHeight - paddingBottom - paddingTop;

  const formatVal = (v: number) => {
    if (isCurrency) return `${Math.round(v).toLocaleString('fr-FR')} €`;
    return `${Math.round(v).toLocaleString('fr-FR')} ${unit}`;
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-slate-200 tracking-wide">{title}</h4>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs inline-block" style={{ backgroundColor: color1 }}></span>
            <span className="text-slate-400">{name1}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs inline-block" style={{ backgroundColor: color2 }}></span>
            <span className="text-slate-400">{name2}</span>
          </div>
        </div>
      </div>

      <div className="relative w-full" style={{ height: `${chartHeight}px` }}>
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
          {data.map((d, i) => {
            const slotW = 100 / data.length;
            const singleBarW = slotW * 0.35;
            const x1 = i * slotW + slotW * 0.12;
            const x2 = x1 + singleBarW + slotW * 0.04;

            const h1 = (d.v1 / maxVal) * usableHeight;
            const h2 = (d.v2 / maxVal) * usableHeight;
            const y1 = paddingTop + usableHeight - h1;
            const y2 = paddingTop + usableHeight - h2;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <rect
                  x={`${x1}%`}
                  y={y1}
                  width={`${singleBarW}%`}
                  height={Math.max(2, h1)}
                  fill={color1}
                  rx="1.5"
                  opacity={hoverIndex === null || hoverIndex === i ? 0.9 : 0.4}
                />
                <rect
                  x={`${x2}%`}
                  y={y2}
                  width={`${singleBarW}%`}
                  height={Math.max(2, h2)}
                  fill={color2}
                  rx="1.5"
                  opacity={hoverIndex === null || hoverIndex === i ? 0.9 : 0.4}
                />
              </g>
            );
          })}
        </svg>

        {/* Labels at bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
          {data.map((d, i) => (
            <div key={i} className="text-[10px] font-mono text-center flex-1 text-slate-400">
              {d.label}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hoverIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none -top-2 bg-slate-950 border border-slate-700 text-white text-[11px] rounded px-2.5 py-1.5 shadow-lg font-mono -translate-x-1/2 whitespace-nowrap"
            style={{
              left: `${(hoverIndex + 0.5) * (100 / data.length)}%`,
            }}
          >
            <div className="font-semibold text-slate-300">{data[hoverIndex].label}</div>
            <div style={{ color: color1 }} className="text-[10px]">{name1}: {formatVal(data[hoverIndex].v1)}</div>
            <div style={{ color: color2 }} className="text-[10px]">{name2}: {formatVal(data[hoverIndex].v2)}</div>
          </div>
        )}
      </div>
    </div>
  );
};
