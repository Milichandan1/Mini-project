import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { ComparisonPoint } from "../lib/types";
import { cities } from "../data/cities";
import { getAqiColor } from "../lib/aqi";

export function MapPanel({ comparison, selectedCity, onSelectCity }: {
  comparison: ComparisonPoint[];
  selectedCity: string;
  onSelectCity: (city: string) => void;
}) {
  return (
    <section className="dashboard-shell overflow-hidden p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="section-title">Northeast India map</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">OpenStreetMap + Leaflet</p>
      </div>
      <div className="map-frame h-[430px]">
        <MapContainer center={[25.8, 92.7]} zoom={6} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {cities.map((city) => {
            const point = comparison.find((item) => item.city === city.name);
            const aqi = point?.aqi ?? 80;
            return (
              <CircleMarker
                key={city.name}
                center={[city.lat, city.lon]}
                radius={city.name === selectedCity ? 16 : 11}
                pathOptions={{
                  color: "#101415",
                  weight: city.name === selectedCity ? 3 : 1,
                  fillColor: getAqiColor(aqi),
                  fillOpacity: 0.82
                }}
                eventHandlers={{ click: () => onSelectCity(city.name) }}
              >
                <Popup>
                  <strong>{city.name}</strong>
                  <br />
                  AQI {aqi} - {point?.category ?? "Moderate"}
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </section>
  );
}
