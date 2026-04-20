import { Download, Wind } from "lucide-react";
import { LiveReading, TrendPoint } from "../lib/types";

export function InsightsPanel({ reading, monthly }: { reading: LiveReading; monthly: TrendPoint[] }) {
  const average = Math.round(monthly.reduce((sum, item) => sum + item.aqi, 0) / Math.max(monthly.length, 1));
  const peak = monthly.reduce((max, item) => Math.max(max, item.aqi), 0);

  function exportReport() {
    document.title = `${reading.city.name} AQI Report`;
    window.print();
  }

  return (
    <section className="dashboard-shell p-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="section-title">Data insights</h3>
        <button className="button-primary" onClick={exportReport}>
          <Download size={16} />
          Export PDF
        </button>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="insight-tile">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Monthly average</p>
          <p className="mt-2 text-3xl font-black">{average}</p>
        </div>
        <div className="insight-tile">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Monthly peak</p>
          <p className="mt-2 text-3xl font-black">{peak}</p>
        </div>
        <div className="insight-tile">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Wind effect</p>
          <p className="mt-2 flex items-center gap-2 text-3xl font-black">
            <Wind size={24} /> {reading.weather.windSpeed} m/s
          </p>
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
        PM2.5 usually drives health risk in dense traffic corridors, while PM10 spikes faster around dry roads,
        construction dust, and quarry activity. Higher wind speeds can disperse pollutants but may also move dust
        from exposed surfaces into urban neighborhoods.
      </p>
    </section>
  );
}
