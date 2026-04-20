import { LiveReading } from "../lib/types";

const descriptions = {
  pm25: "Fine particles that enter deep lungs and can affect heart and respiratory health.",
  pm10: "Coarse dust from roads, construction, and natural sources that irritates airways.",
  co: "Carbon monoxide reduces oxygen delivery, especially near congestion or combustion.",
  no2: "Nitrogen dioxide from vehicles and burning can trigger asthma and inflammation.",
  so2: "Sulfur dioxide can irritate the throat and worsen breathing for sensitive groups."
};

export function PollutantGrid({ reading }: { reading: LiveReading }) {
  return (
    <section className="dashboard-shell p-5">
      <h3 className="section-title">Pollutant health signals</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Object.entries(reading.pollutants).map(([key, value]) => (
          <article key={key} className="rounded-lg border border-black/10 bg-white/45 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm uppercase text-zinc-500 dark:text-zinc-400">{key.replace("pm", "PM")}</p>
            <p className="mt-2 text-2xl font-black text-ink dark:text-white">{value}</p>
            <p className="mt-2 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
              {descriptions[key as keyof typeof descriptions]}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
