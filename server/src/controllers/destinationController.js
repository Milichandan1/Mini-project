import { destinations } from "../data/destinations.js";

export function listDestinations(req, res) {
  const search = String(req.query.search ?? "").toLowerCase();
  const region = String(req.query.region ?? "all");
  const category = String(req.query.category ?? "all");

  const filtered = destinations.filter((destination) => {
    const text = `${destination.name} ${destination.country} ${destination.summary}`.toLowerCase();
    return (
      (!search || text.includes(search)) &&
      (region === "all" || destination.region === region) &&
      (category === "all" || destination.category === category)
    );
  });

  res.json({ destinations: filtered });
}
