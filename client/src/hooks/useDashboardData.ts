import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { ComparisonPoint, LiveReading, PredictionPoint, TrendPoint } from "../lib/types";

export function useDashboardData(city: string) {
  const [live, setLive] = useState<LiveReading | null>(null);
  const [weekly, setWeekly] = useState<TrendPoint[]>([]);
  const [monthly, setMonthly] = useState<TrendPoint[]>([]);
  const [comparison, setComparison] = useState<ComparisonPoint[]>([]);
  const [prediction, setPrediction] = useState<PredictionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextLive = await api.live(city);
      const [nextWeekly, nextMonthly, nextComparison, nextPrediction] = await Promise.all([
        api.trends(city, "weekly"),
        api.trends(city, "monthly"),
        api.comparison(),
        api.predict(nextLive)
      ]);

      setLive(nextLive);
      setWeekly(nextWeekly);
      setMonthly(nextMonthly);
      setComparison(nextComparison);
      setPrediction(nextPrediction);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { live, weekly, monthly, comparison, prediction, loading, error, refresh };
}
