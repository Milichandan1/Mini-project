import { ShieldAlert } from "lucide-react";
import { getAqiColor, getPrecaution } from "../lib/aqi";
import { LiveReading } from "../lib/types";

export function AqiGauge({ reading }: { reading: LiveReading }) {
  const color = getAqiColor(reading.aqi);
  const circumference = 2 * Math.PI * 78;
  const progress = Math.min(reading.aqi / 500, 1) * circumference;

  return (
    <section className="dashboard-shell p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        <div className="relative mx-auto h-52 w-52 shrink-0">
          <svg viewBox="0 0 180 180" className="h-full w-full rotate-[-90deg]">
            <circle cx="90" cy="90" r="78" stroke="currentColor" strokeWidth="16" className="text-zinc-200 dark:text-white/10" fill="none" />
            <circle
              cx="90"
              cy="90"
              r="78"
              stroke={color}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              fill="none"
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">AQI</p>
              <p className="text-5xl font-black text-ink dark:text-white">{reading.aqi}</p>
              <p className="font-bold" style={{ color }}>
                {reading.category}
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-mint">Selected city</p>
          <h2 className="mt-2 text-3xl font-black text-ink dark:text-white">
            {reading.city.name}, {reading.city.state}
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-300">
            Updated {new Date(reading.updatedAt).toLocaleString()} from {reading.source}.
          </p>
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-coral/30 bg-coral/10 p-4">
            <ShieldAlert className="mt-0.5 shrink-0 text-coral" size={20} />
            <div>
              <p className="font-bold text-ink dark:text-white">Smart alert</p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{getPrecaution(reading.aqi)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
