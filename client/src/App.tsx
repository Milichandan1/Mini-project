import { Activity, CloudSun, Droplets, Wind } from "lucide-react";
import { Header } from "./components/Header";
import { AqiGauge } from "./components/AqiGauge";
import { Chatbot } from "./components/Chatbot";
import { ComparisonChart, PredictionChart, TrendChart } from "./components/Charts";
import { InsightsPanel } from "./components/InsightsPanel";
import { MapPanel } from "./components/MapPanel";
import { MetricCard } from "./components/MetricCard";
import { PollutantGrid } from "./components/PollutantGrid";
import { cities } from "./data/cities";
import { useDashboardData } from "./hooks/useDashboardData";
import { useTheme } from "./hooks/useTheme";
import { getAqiColor } from "./lib/aqi";
import { useState } from "react";

export default function App() {
  const [selectedCity, setSelectedCity] = useState("Guwahati");
  const { theme, toggleTheme } = useTheme();
  const { live, weekly, monthly, comparison, prediction, loading, error, refresh } = useDashboardData(selectedCity);

  return (
    <main className="min-h-screen bg-fog text-ink transition-colors dark:bg-ink dark:text-white">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(135deg,rgba(69,196,160,0.12),transparent_42%,rgba(255,107,95,0.09))]" />
      <div id="dashboard-report" className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:px-8">
        <Header
          cities={cities}
          selectedCity={selectedCity}
          theme={theme}
          loading={loading}
          onCityChange={setSelectedCity}
          onThemeToggle={toggleTheme}
          onRefresh={refresh}
        />

        {error && (
          <div className="dashboard-shell border-coral/40 bg-coral/10 p-4 text-sm text-coral">
            {error}. Check API service status or environment variables.
          </div>
        )}

        {!live ? (
          <div className="dashboard-shell grid min-h-96 place-items-center p-8 text-zinc-600 dark:text-zinc-300">
            Loading Northeast air intelligence...
          </div>
        ) : (
          <>
            <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <AqiGauge reading={live} />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                <MetricCard
                  title="Temperature"
                  value={`${live.weather.temperature}°C`}
                  detail={`${live.weather.condition}, ${live.weather.humidity}% humidity`}
                  accent="#f3b743"
                  icon={<CloudSun size={22} />}
                />
                <MetricCard
                  title="Ventilation"
                  value={`${live.weather.windSpeed} m/s`}
                  detail="Wind speed used as a key prediction feature"
                  accent="#45c4a0"
                  icon={<Wind size={22} />}
                />
              </div>
            </section>

            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="PM2.5"
                value={live.pollutants.pm25}
                detail="Fine particulate matter"
                accent={getAqiColor(live.aqi)}
                icon={<Activity size={22} />}
              />
              <MetricCard title="PM10" value={live.pollutants.pm10} detail="Dust and coarse particles" accent="#ff8a4c" icon={<Activity size={22} />} />
              <MetricCard title="NO2" value={live.pollutants.no2} detail="Traffic and combustion marker" accent="#ff6b5f" icon={<Droplets size={22} />} />
              <MetricCard title="SO2" value={live.pollutants.so2} detail="Industrial and burning marker" accent="#8f7cf6" icon={<Droplets size={22} />} />
            </section>

            <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
              <MapPanel comparison={comparison} selectedCity={selectedCity} onSelectCity={setSelectedCity} />
              <TrendChart data={weekly} />
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <PredictionChart data={prediction} />
              <ComparisonChart data={comparison} />
            </section>

            <PollutantGrid reading={live} />

            <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <InsightsPanel reading={live} monthly={monthly} />
              <Chatbot city={selectedCity} />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
