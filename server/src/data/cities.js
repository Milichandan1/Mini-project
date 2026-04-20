export const cities = [
  { name: "Guwahati", state: "Assam", lat: 26.1445, lon: 91.7362, population: 1116267, baselineAqi: 118 },
  { name: "Shillong", state: "Meghalaya", lat: 25.5788, lon: 91.8933, population: 354759, baselineAqi: 64 },
  { name: "Itanagar", state: "Arunachal Pradesh", lat: 27.0844, lon: 93.6053, population: 59490, baselineAqi: 58 },
  { name: "Kohima", state: "Nagaland", lat: 25.6751, lon: 94.1086, population: 99039, baselineAqi: 70 },
  { name: "Imphal", state: "Manipur", lat: 24.817, lon: 93.9368, population: 268243, baselineAqi: 86 },
  { name: "Aizawl", state: "Mizoram", lat: 23.7271, lon: 92.7176, population: 293416, baselineAqi: 52 },
  { name: "Agartala", state: "Tripura", lat: 23.8315, lon: 91.2868, population: 400004, baselineAqi: 102 },
  { name: "Gangtok", state: "Sikkim", lat: 27.3314, lon: 88.6138, population: 100286, baselineAqi: 48 },
  { name: "Dibrugarh", state: "Assam", lat: 27.4728, lon: 94.912, population: 154019, baselineAqi: 92 },
  { name: "Silchar", state: "Assam", lat: 24.8333, lon: 92.7789, population: 172830, baselineAqi: 96 }
];

export function findCity(name = "Guwahati") {
  return cities.find((city) => city.name.toLowerCase() === name.toLowerCase()) ?? cities[0];
}
