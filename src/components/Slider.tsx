import { cn } from "../utils/cn";

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  display?: string;
  onChange: (v: number) => void;
  onBegin?: () => void;
  gold?: boolean;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  display,
  onChange,
  onBegin,
  gold,
}: Props) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">
          {label}
        </span>
        <span className={cn("font-mono text-[11px] tabular-nums", gold ? "text-gold" : "text-stone-300")}>
          {display ?? `${Math.round(value * 100) / 100}${suffix}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerDown={onBegin}
        className={cn("lumina-range w-full", gold && "lumina-range-gold")}
      />
    </label>
  );
}
