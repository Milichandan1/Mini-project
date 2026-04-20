import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { ComparisonPoint, PredictionPoint, TrendPoint } from "../lib/types";
import { getAqiColor } from "../lib/aqi";

const tooltipStyle = {
  background: "rgba(16, 20, 21, 0.92)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "#fff"
};

export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <section className="dashboard-shell p-5">
      <h3 className="section-title">Weekly AQI trend</h3>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#45c4a0" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#45c4a0" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(130,130,130,0.18)" />
            <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { weekday: "short" })} />
            <YAxis />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="aqi" stroke="#45c4a0" fill="url(#aqiGradient)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function PredictionChart({ data }: { data: PredictionPoint[] }) {
  return (
    <section className="dashboard-shell p-5">
      <h3 className="section-title">AI prediction, next 48 hours</h3>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(130,130,130,0.18)" />
            <XAxis dataKey="hour" tickFormatter={(value) => `${value}h`} />
            <YAxis />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="predictedAqi" stroke="#ff6b5f" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function ComparisonChart({ data }: { data: ComparisonPoint[] }) {
  const chartData = data.map((point) => ({ ...point, fill: getAqiColor(point.aqi) }));

  return (
    <section className="dashboard-shell p-5">
      <h3 className="section-title">City comparison</h3>
      <div className="mt-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(130,130,130,0.18)" />
            <XAxis type="number" />
            <YAxis dataKey="city" type="category" width={84} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="aqi" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
