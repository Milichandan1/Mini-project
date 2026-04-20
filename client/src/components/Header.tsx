import { Moon, RefreshCcw, Sun } from "lucide-react";
import { City } from "../lib/types";

interface HeaderProps {
  cities: City[];
  selectedCity: string;
  theme: "dark" | "light";
  loading: boolean;
  onCityChange: (city: string) => void;
  onThemeToggle: () => void;
  onRefresh: () => void;
}

export function Header({
  cities,
  selectedCity,
  theme,
  loading,
  onCityChange,
  onThemeToggle,
  onRefresh
}: HeaderProps) {
  return (
    <header className="dashboard-shell flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mint">Northeast Air Intelligence</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-ink dark:text-white sm:text-4xl">
          Pollution command center
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
          Live AQI, pollutant loads, weather signals, and 48-hour AI prediction for Northeast India.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedCity}
          onChange={(event) => onCityChange(event.target.value)}
          className="control min-w-40"
          aria-label="Select city"
        >
          {cities.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}, {city.state}
            </option>
          ))}
        </select>
        <button className="icon-button" onClick={onRefresh} disabled={loading} aria-label="Refresh data">
          <RefreshCcw className={loading ? "animate-spin" : ""} size={18} />
        </button>
        <button className="icon-button" onClick={onThemeToggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
