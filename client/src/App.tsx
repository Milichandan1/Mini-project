import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  Compass,
  Filter,
  LogOut,
  Mail,
  MapPin,
  Moon,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  UserRound
} from "lucide-react";
import { api, ApiError } from "./lib/api";
import { Booking, Destination, User } from "./lib/types";

const REGIONS = ["all", "Asia", "Europe", "Africa", "South America"];
const CATEGORIES = ["all", "Beach", "Mountain", "Culture", "Romantic", "Adventure"];
const TOKEN_KEY = "voyage_token";

type Notice = { type: "success" | "error"; text: string } | null;

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function SkeletonCard() {
  return (
    <div className="glass-panel overflow-hidden">
      <div className="h-56 animate-pulse bg-white/40 dark:bg-white/10" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    localStorage.getItem("voyage_theme") === "dark" ? "dark" : "light"
  );
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? "");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [filters, setFilters] = useState({ search: "", region: "all", category: "all" });
  const [bookingForm, setBookingForm] = useState({
    travelDate: "",
    guests: 2,
    fullName: "",
    phone: "",
    notes: ""
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("voyage_theme", theme);
  }, [theme]);

  useEffect(() => {
    document.title = "Voyage | Premium Travel Experiences";
    const description = "Book premium curated travel experiences with Voyage.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .destinations(filters)
      .then((payload) => {
        if (!mounted) return;
        setDestinations(payload.destinations);
        setSelectedDestination((current) => current ?? payload.destinations[0] ?? null);
      })
      .catch((error) => setNotice({ type: "error", text: error instanceof Error ? error.message : "Unable to load trips." }))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [filters]);

  useEffect(() => {
    if (!token) return;
    api
      .me(token)
      .then(({ user: nextUser }) => setUser(nextUser))
      .then(() => refreshBookings(token))
      .catch(() => logout());
  }, [token]);

  const featuredDestination = selectedDestination ?? destinations[0];

  const stats = useMemo(
    () => [
      ["48K+", "happy travelers"],
      ["62", "curated routes"],
      ["4.9", "average rating"]
    ],
    []
  );

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
    setBookings([]);
  }

  async function refreshBookings(activeToken = token) {
    if (!activeToken) return;
    const payload = await api.bookings(activeToken);
    setBookings(payload.bookings);
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? "")
    };

    try {
      const session =
        authMode === "register" ? await api.register(payload) : await api.login({ email: payload.email, password: payload.password });
      localStorage.setItem(TOKEN_KEY, session.token);
      setToken(session.token);
      setUser(session.user);
      setNotice({ type: "success", text: `Welcome ${session.user.name}. Your dashboard is ready.` });
      await refreshBookings(session.token);
    } catch (error) {
      setNotice({ type: "error", text: error instanceof ApiError ? error.message : "Authentication failed." });
    }
  }

  async function handleBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!featuredDestination) return;
    if (!user || !token) {
      setNotice({ type: "error", text: "Please log in before booking a journey." });
      return;
    }

    try {
      const payload = await api.createBooking(token, {
        destinationId: featuredDestination.id,
        ...bookingForm
      });
      setBookings((current) => [payload.booking, ...current]);
      setNotice({ type: "success", text: `${featuredDestination.name} is confirmed for ${bookingForm.guests} travelers.` });
      setBookingForm({ travelDate: "", guests: 2, fullName: "", phone: "", notes: "" });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof ApiError ? error.message : "Booking failed." });
    }
  }

  async function handleContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const response = await api.contact({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        subject: String(data.get("subject") ?? ""),
        message: String(data.get("message") ?? "")
      });
      setNotice({ type: "success", text: response.message });
      event.currentTarget.reset();
    } catch (error) {
      setNotice({ type: "error", text: error instanceof ApiError ? error.message : "Message failed." });
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8ff] text-slate-950 transition-colors dark:bg-[#070917] dark:text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_15%,rgba(59,130,246,0.22),transparent_34%),radial-gradient(circle_at_82%_4%,rgba(168,85,247,0.18),transparent_30%),linear-gradient(135deg,rgba(20,184,166,0.08),transparent_55%)]" />

      <header className="sticky top-0 z-40 border-b border-white/30 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#070917]/70">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a className="flex items-center gap-2 font-black tracking-tight" href="#home">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/25">
              <Plane size={21} />
            </span>
            Voyage
          </a>
          <div className="hidden items-center gap-6 text-sm font-bold text-slate-600 dark:text-slate-300 md:flex">
            <a href="#destinations">Destinations</a>
            <a href="#booking">Booking</a>
            <a href="#dashboard">Dashboard</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="flex items-center gap-2">
            <button className="icon-button" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <button className="icon-button" onClick={logout} aria-label="Log out" title="Log out">
                <LogOut size={18} />
              </button>
            ) : (
              <a className="button-primary" href="#account">
                <UserRound size={18} />
                Sign in
              </a>
            )}
          </div>
        </nav>
      </header>

      <section id="home" className="relative isolate overflow-hidden">
        <img
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=85"
          alt="Turquoise tropical beach from above"
          loading="eager"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950/75 via-blue-950/45 to-violet-950/45" />
        <div className="mx-auto grid min-h-[calc(100vh-68px)] max-w-7xl content-center gap-8 px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl text-white"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/15 px-3 py-2 text-sm font-bold backdrop-blur-xl">
              <Sparkles size={16} />
              Bespoke journeys, verified local experts
            </div>
            <h1 className="text-5xl font-black leading-[1.02] tracking-normal sm:text-7xl">Voyage</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-50 sm:text-xl">
              Premium travel planning for people who want the magic handled and the details done right.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="button-primary bg-white text-slate-950 hover:border-white" href="#destinations">
                <Compass size={18} />
                Explore trips
              </a>
              <a className="button-primary bg-blue-600 text-white hover:border-blue-200" href="#booking">
                <CalendarDays size={18} />
                Book now
              </a>
            </div>
          </motion.div>
          <div className="grid gap-3 sm:grid-cols-3">
            {stats.map(([value, label]) => (
              <div key={label} className="glass-panel border-white/25 bg-white/15 p-5 text-white">
                <p className="text-3xl font-black">{value}</p>
                <p className="text-sm text-blue-50">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="destinations" className="mx-auto max-w-7xl space-y-6 px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Curated escapes</p>
            <h2 className="section-heading">Search your next destination</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_170px_170px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                className="control w-full pl-10"
                placeholder="Search trips"
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              />
            </label>
            <label className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                className="control w-full pl-10"
                value={filters.region}
                onChange={(event) => setFilters((current) => ({ ...current, region: event.target.value }))}
              >
                {REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region === "all" ? "All regions" : region}
                  </option>
                ))}
              </select>
            </label>
            <select
              className="control w-full"
              value={filters.category}
              onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All styles" : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
            : destinations.map((destination, index) => (
                <motion.article
                  key={destination.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="glass-panel group overflow-hidden"
                >
                  <button className="block w-full text-left" onClick={() => setSelectedDestination(destination)}>
                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      />
                      <div className="absolute left-4 top-4 rounded-lg bg-white/90 px-3 py-1 text-sm font-black text-blue-700 backdrop-blur">
                        {destination.category}
                      </div>
                    </div>
                    <div className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-black">{destination.name}</h3>
                          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-300">
                            <MapPin size={15} />
                            {destination.country}
                          </p>
                        </div>
                        <span className="flex items-center gap-1 rounded-lg bg-amber-300/25 px-2 py-1 text-sm font-black text-amber-700 dark:text-amber-200">
                          <Star size={15} fill="currentColor" />
                          {destination.rating}
                        </span>
                      </div>
                      <p className="min-h-16 text-sm leading-6 text-slate-600 dark:text-slate-300">{destination.summary}</p>
                      <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-white/10">
                        <span className="text-sm font-bold text-slate-500 dark:text-slate-300">{destination.duration}</span>
                        <span className="text-lg font-black text-blue-700 dark:text-blue-300">{formatPrice(destination.price)}</span>
                      </div>
                    </div>
                  </button>
                </motion.article>
              ))}
        </div>
      </section>

      {featuredDestination && (
        <section id="booking" className="bg-white/60 py-16 backdrop-blur dark:bg-white/[0.03]">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
            <div className="space-y-5">
              <p className="eyebrow">Selected journey</p>
              <h2 className="section-heading">{featuredDestination.name}</h2>
              <p className="text-slate-600 dark:text-slate-300">{featuredDestination.summary}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {featuredDestination.highlights.map((highlight) => (
                  <div key={highlight} className="glass-panel p-4">
                    <Check className="mb-3 text-teal-500" size={20} />
                    <p className="text-sm font-bold">{highlight}</p>
                  </div>
                ))}
              </div>
              <div className="map-frame h-80">
                <iframe
                  title={`${featuredDestination.name} map`}
                  className="h-full w-full border-0"
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${featuredDestination.coordinates.lat},${featuredDestination.coordinates.lng}&z=9&output=embed`}
                />
              </div>
            </div>

            <form className="glass-panel space-y-4 p-5" onSubmit={handleBooking}>
              <div>
                <p className="eyebrow">Reserve</p>
                <h3 className="text-2xl font-black">Book this experience</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  className="control"
                  required
                  placeholder="Full name"
                  value={bookingForm.fullName}
                  onChange={(event) => setBookingForm((current) => ({ ...current, fullName: event.target.value }))}
                />
                <input
                  className="control"
                  required
                  placeholder="Phone"
                  value={bookingForm.phone}
                  onChange={(event) => setBookingForm((current) => ({ ...current, phone: event.target.value }))}
                />
                <input
                  className="control"
                  required
                  type="date"
                  value={bookingForm.travelDate}
                  onChange={(event) => setBookingForm((current) => ({ ...current, travelDate: event.target.value }))}
                />
                <input
                  className="control"
                  required
                  type="number"
                  min={1}
                  max={12}
                  value={bookingForm.guests}
                  onChange={(event) => setBookingForm((current) => ({ ...current, guests: Number(event.target.value) }))}
                />
              </div>
              <textarea
                className="control min-h-28 w-full py-3"
                placeholder="Travel notes, room preferences, accessibility needs"
                value={bookingForm.notes}
                onChange={(event) => setBookingForm((current) => ({ ...current, notes: event.target.value }))}
              />
              <div className="flex items-center justify-between rounded-lg bg-blue-600/10 p-4">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Estimated total</span>
                <span className="text-2xl font-black text-blue-700 dark:text-blue-300">
                  {formatPrice(featuredDestination.price * bookingForm.guests)}
                </span>
              </div>
              <button className="button-primary w-full bg-blue-600 text-white" type="submit">
                <ShieldCheck size={18} />
                Confirm booking
              </button>
            </form>
          </div>
        </section>
      )}

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div id="account" className="glass-panel p-5">
          <p className="eyebrow">Account</p>
          <h2 className="section-heading">{user ? `Hi, ${user.name}` : "Login or register"}</h2>
          {user ? (
            <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>{user.email}</p>
              <button className="button-primary bg-slate-950 text-white dark:bg-white dark:text-slate-950" onClick={logout}>
                <LogOut size={18} />
                Log out
              </button>
            </div>
          ) : (
            <form className="mt-5 space-y-4" onSubmit={handleAuth}>
              <div className="grid grid-cols-2 rounded-lg bg-slate-200 p-1 dark:bg-white/10">
                {(["login", "register"] as const).map((mode) => (
                  <button
                    key={mode}
                    className={`rounded-md px-3 py-2 text-sm font-black capitalize ${
                      authMode === mode ? "bg-white text-blue-700 shadow dark:bg-slate-950" : "text-slate-600 dark:text-slate-300"
                    }`}
                    type="button"
                    onClick={() => setAuthMode(mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              {authMode === "register" && <input className="control w-full" name="name" required placeholder="Name" />}
              <input className="control w-full" name="email" required type="email" placeholder="Email" />
              <input className="control w-full" name="password" required type="password" minLength={8} placeholder="Password" />
              <button className="button-primary w-full bg-blue-600 text-white" type="submit">
                <UserRound size={18} />
                Continue
              </button>
            </form>
          )}
        </div>

        <div id="dashboard" className="glass-panel p-5">
          <p className="eyebrow">Dashboard</p>
          <h2 className="section-heading">Your bookings</h2>
          <div className="mt-5 space-y-3">
            {bookings.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-white/15 dark:text-slate-300">
                Sign in and book a journey to see it here.
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking._id} className="rounded-lg border border-slate-200 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-black">{booking.destinationName}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-300">
                        {new Date(booking.travelDate).toLocaleDateString()} for {booking.guests} travelers
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-black text-blue-700 dark:text-blue-300">{formatPrice(booking.totalPrice)}</p>
                      <p className="text-xs font-bold uppercase tracking-wide text-teal-600">{booking.status}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="glass-panel grid gap-6 p-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Contact</p>
            <h2 className="section-heading">Plan with a travel designer</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Tell us the occasion, season, and pace you prefer. We will turn it into a clean, bookable itinerary.
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm font-bold text-blue-700 dark:text-blue-300">
              <Mail size={18} />
              hello@voyage.example
            </div>
          </div>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleContact}>
            <input className="control" name="name" required placeholder="Name" />
            <input className="control" name="email" required type="email" placeholder="Email" />
            <input className="control sm:col-span-2" name="subject" required placeholder="Subject" />
            <textarea className="control min-h-32 py-3 sm:col-span-2" name="message" required placeholder="Message" />
            <button className="button-primary bg-blue-600 text-white sm:col-span-2" type="submit">
              <Mail size={18} />
              Send message
            </button>
          </form>
        </div>
      </section>

      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-4 right-4 z-50 max-w-sm rounded-lg px-4 py-3 text-sm font-bold shadow-2xl ${
              notice.type === "success" ? "bg-teal-500 text-white" : "bg-rose-500 text-white"
            }`}
            role="status"
            onClick={() => setNotice(null)}
          >
            {notice.text}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
