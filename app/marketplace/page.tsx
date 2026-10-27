"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Search,
  MapPin,
  Filter,
  X,
  ChevronDown,
  Phone,
  Home,
  Waves,
  Dumbbell,
  Trees,
  Car,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { UIProperty } from "@/lib/mappers";
import { demoProperties } from "@/lib/utils";
import PropertyCard from "@/components/property/PropertyCard";
import { getShortlist, toggleShortlist } from "@/lib/shortlist";

/* ─────────────────────────────────────────────
   EXTRACT BHK from property_type string
───────────────────────────────────────────── */
function extractBHK(type: string): number | null {
  const m = type.match(/(\d+)\s*bhk/i);
  return m ? parseInt(m[1]) : null;
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function MarketplacePage() {
  const [properties, setProperties] = useState<UIProperty[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200_000_000);
  const [selectedBHK, setSelectedBHK] = useState<number[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLikedIds(new Set(getShortlist()));
  }, []);
  const [cityOpen, setCityOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [filterCityOpen, setFilterCityOpen] = useState(false);
  const [filterTypeOpen, setFilterTypeOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const CITIES = [
    "All",
    "Bangalore",
    "Whitefield",
    "Panathur",
    "Dubai",
    "Abu Dhabi",
  ];
  const TYPES = ["All", "Apartment", "Villa", "Penthouse", "Townhouse", "Plot"];
  const BHK_OPTIONS = [1, 2, 3, 4];
  const AMENITY_ICONS: Record<string, React.ReactNode> = {
    Pool: <Waves className="w-4 h-4" />,
    Gym: <Dumbbell className="w-4 h-4" />,
    Garden: <Trees className="w-4 h-4" />,
    Parking: <Car className="w-4 h-4" />,
  };
  const AMENITY_LIST = ["Pool", "Gym", "Garden", "Parking"];
  const SORT_OPTIONS = [
    { value: "featured", label: "Featured First" },
    { value: "price-asc", label: "Price: Low → High" },
    { value: "price-desc", label: "Price: High → Low" },
    { value: "newest", label: "Newest First" },
  ];

  /* ── Fetch ── */
  useEffect(() => {
    fetch("/api/properties", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: UIProperty[]) => {
        // Use Supabase as the single source of truth in production.
        // Only fall back to demo/mock data during development.
        const isProd = typeof process !== "undefined" && process.env && process.env.NODE_ENV === "production";
        if (Array.isArray(d) && d.length) {
          setProperties(d);
        } else if (!isProd) {
          setProperties(
            demoProperties.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              location: `${p.area}, ${p.city}`,
              area: p.area ?? "",
              city: p.city,
              property_type: p.property_type,
              price: p.price,
              currency: p.currency,
              amenities: [],
              featured: p.featured ?? false,
              status: p.status ?? "available",
              investment_score: p.investment_score ?? 80,
            })),
          );
        } else {
          // In production, prefer an empty list over showing mismatched mock data.
          setProperties([]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* ── Filter + sort ── */
  const filtered = useMemo(() => {
    let r = [...properties];

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.property_type.toLowerCase().includes(q) ||
          p.area?.toLowerCase().includes(q),
      );
    }

    // City
    if (selectedCity !== "All")
      r = r.filter(
        (p) =>
          p.city?.toLowerCase().includes(selectedCity.toLowerCase()) ||
          p.location.toLowerCase().includes(selectedCity.toLowerCase()),
      );

    // Type
    if (selectedType !== "All")
      r = r.filter((p) =>
        p.property_type.toLowerCase().includes(selectedType.toLowerCase()),
      );

    // Price
    r = r.filter((p) => p.price >= minPrice && p.price <= maxPrice);

    // BHK
    if (selectedBHK.length > 0)
      r = r.filter((p) => {
        const b = extractBHK(p.property_type);
        return b !== null && selectedBHK.includes(b);
      });

    // Amenities
    if (selectedAmenities.length > 0)
      r = r.filter((p) =>
        selectedAmenities.every((a) =>
          p.amenities.some((pa) => pa.toLowerCase().includes(a.toLowerCase())),
        ),
      );

    // Sort
    if (sortBy === "price-asc") r.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") r.sort((a, b) => b.price - a.price);
    if (sortBy === "featured")
      r.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    return r;
  }, [
    properties,
    search,
    selectedCity,
    selectedType,
    minPrice,
    maxPrice,
    selectedBHK,
    selectedAmenities,
    sortBy,
  ]);

  const clearAll = () => {
    setSearch("");
    setSelectedCity("All");
    setSelectedType("All");
    setMinPrice(0);
    setMaxPrice(200_000_000);
    setSelectedBHK([]);
    setSelectedAmenities([]);
  };

  const toggleAmenity = (a: string) =>
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );

  const toggleBHK = (b: number) =>
    setSelectedBHK((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
    );

  const toggleLike = (id: string) => {
    const next = toggleShortlist(id);
    setLikedIds(new Set(next));
  };

  const activeFilters = [
    selectedCity !== "All",
    selectedType !== "All",
    maxPrice < 200_000_000,
    selectedBHK.length > 0,
    selectedAmenities.length > 0,
  ].filter(Boolean).length;

  const filterContent = (
    <>
      {/* Location */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <label
            className="text-xs font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Location
          </label>
        </div>
        <div className="relative">
          <button
            onClick={() => {
              setFilterCityOpen(!filterCityOpen);
              setFilterTypeOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm"
            style={{
              background: "var(--glass-1-bg)",
              border: "1px solid var(--glass-1-border)",
              color:
                selectedCity === "All"
                  ? "var(--text-muted)"
                  : "var(--text-primary)",
            }}
          >
            {selectedCity === "All" ? "Select location" : selectedCity}
            <ChevronDown
              className="w-3.5 h-3.5"
              style={{
                color: "var(--text-muted)",
                transform: filterCityOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </button>
          <AnimatePresence>
            {filterCityOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-2 w-full z-50 rounded-xl overflow-hidden"
                style={{
                  background: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid var(--glass-2-border)",
                  backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                }}
              >
                {CITIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedCity(c);
                      setFilterCityOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-white/5"
                    style={{
                      color:
                        selectedCity === c
                          ? "var(--gold-400)"
                          : "var(--text-secondary)",
                      background:
                        selectedCity === c
                          ? "rgba(99,102,241,0.08)"
                          : "transparent",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Property Type */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <label
            className="text-xs font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Property Type
          </label>
        </div>
        <div className="relative">
          <button
            onClick={() => {
              setFilterTypeOpen(!filterTypeOpen);
              setFilterCityOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm"
            style={{
              background: "var(--glass-1-bg)",
              border: "1px solid var(--glass-1-border)",
              color:
                selectedType === "All"
                  ? "var(--text-muted)"
                  : "var(--text-primary)",
            }}
          >
            {selectedType === "All" ? "Any type" : selectedType}
            <ChevronDown
              className="w-3.5 h-3.5"
              style={{
                color: "var(--text-muted)",
                transform: filterTypeOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </button>
          <AnimatePresence>
            {filterTypeOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-2 w-full z-50 rounded-xl overflow-hidden"
                style={{
                  background: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid var(--glass-2-border)",
                  backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                }}
              >
                {TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setSelectedType(t);
                      setFilterTypeOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-white/5"
                    style={{
                      color:
                        selectedType === t
                          ? "var(--gold-400)"
                          : "var(--text-secondary)",
                      background:
                        selectedType === t
                          ? "rgba(99,102,241,0.08)"
                          : "transparent",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <ChevronDown
            className="w-3 h-3"
            style={{ color: "var(--gold-400)" }}
          />
          <label
            className="text-xs font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Price Range
          </label>
        </div>
        <input
          type="range"
          min={2_000_000}
          max={200_000_000}
          step={2_000_000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(+e.target.value)}
          className="w-full mb-2"
          style={{ accentColor: "var(--gold-500)" }}
        />
        <div
          className="flex items-center justify-between text-[10px]"
          style={{ color: "var(--text-secondary)" }}
        >
          <span>₹ 20 Lakhs</span>
          <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {formatPrice(maxPrice)}
          </span>
          <span>₹ 5 Crores+</span>
        </div>
      </div>

      {/* BHK */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <ChevronDown
            className="w-3 h-3"
            style={{ color: "var(--text-secondary)" }}
          />
          <label
            className="text-xs font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            BHK
          </label>
        </div>
        <div className="flex gap-2 flex-wrap">
          {BHK_OPTIONS.map((b) => (
            <button
              key={b}
              onClick={() => toggleBHK(b)}
              className="w-9 h-9 rounded-xl text-xs font-bold transition-all"
              style={{
                background: selectedBHK.includes(b)
                  ? "linear-gradient(135deg, var(--gold-500), var(--gold-600))"
                  : "var(--glass-1-bg)",
                border: `1px solid ${selectedBHK.includes(b) ? "var(--gold-500)" : "var(--glass-1-border)"}`,
                color: selectedBHK.includes(b)
                  ? "var(--void)"
                  : "var(--text-secondary)",
                boxShadow: selectedBHK.includes(b)
                  ? "0 4px 12px rgba(99,102,241,0.18)"
                  : "none",
              }}
            >
              {b}
            </button>
          ))}
          <button
            onClick={() => toggleBHK(5)}
            className="h-9 px-2.5 rounded-xl text-xs font-bold transition-all"
            style={{
              background: selectedBHK.includes(5)
                ? "linear-gradient(135deg, var(--gold-500), var(--gold-600))"
                : "var(--glass-1-bg)",
              border: `1px solid ${selectedBHK.includes(5) ? "var(--gold-500)" : "var(--glass-1-border)"}`,
              color: selectedBHK.includes(5)
                ? "var(--void)"
                : "var(--text-secondary)",
            }}
          >
            4+
          </button>
        </div>
      </div>

      {/* Removed apply filters button as it doesn't appear in the image */}
    </>
  );

  return (
    <div
      className="min-h-screen relative"
      style={{ background: "transparent" }}
    >
      <div className="relative z-10" style={{ paddingTop: 68 }}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          {/* ══════════════════════════════
              PAGE HEADER
          ══════════════════════════════ */}
          <div className="py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
            >
              {/* Title & Subtitle */}
              <div>
                <h1
                  className="font-display font-black leading-none mb-3"
                  style={{
                    fontSize: "clamp(36px, 4.5vw, 58px)",
                    color: "var(--text-primary)",
                  }}
                >
                  Property{" "}
                  <span className="text-gradient-blue">Marketplace</span>
                </h1>
                <p
                  className="text-base"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Discover verified properties with AI-powered insights and
                  real-time intelligence.
                </p>
              </div>
            </motion.div>
          </div>

          {/* ══════════════════════════════
              SEARCH + SORT BAR
          ══════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search properties, areas, types…"
                id="marketplace-search"
                className="w-full pl-11 pr-4 py-3.5 text-sm outline-none rounded-full"
                style={{
                  background: "var(--glass-2-bg)",
                  border: "1px solid var(--glass-2-border)",
                  color: "var(--text-primary)",
                  backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                  WebkitBackdropFilter:
                    "blur(var(--glass-2-blur)) saturate(160%)",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border-gold)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--glass-2-border)")
                }
              />
            </div>

            {/* City selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setCityOpen(!cityOpen);
                  setTypeOpen(false);
                }}
                id="city-selector"
                className="w-full sm:w-auto flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-medium whitespace-nowrap"
                style={{
                  background: "var(--glass-2-bg)",
                  border: "1px solid var(--glass-2-border)",
                  color: "var(--text-primary)",
                  backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                  WebkitBackdropFilter:
                    "blur(var(--glass-2-blur)) saturate(160%)",
                  minWidth: 140,
                }}
              >
                <MapPin
                  className="w-3.5 h-3.5"
                  style={{ color: "var(--gold-400)" }}
                />
                {selectedCity === "All" ? "All Cities" : selectedCity}
                <ChevronDown
                  className="w-3.5 h-3.5 ml-auto"
                  style={{
                    color: "var(--text-muted)",
                    transform: cityOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
              <AnimatePresence>
                {cityOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-full z-50 rounded-2xl overflow-hidden"
                    style={{
                      background: "var(--glass-3-bg)",
                      border: "1px solid var(--border-gold)",
                      backdropFilter:
                        "blur(var(--glass-3-blur)) saturate(160%)",
                      WebkitBackdropFilter:
                        "blur(var(--glass-3-blur)) saturate(160%)",
                      boxShadow: "0 20px 50px rgba(15,23,42,0.12)",
                    }}
                  >
                    {CITIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setSelectedCity(c);
                          setCityOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                        style={{
                          color:
                            selectedCity === c
                              ? "var(--gold-400)"
                              : "var(--text-secondary)",
                          background:
                            selectedCity === c
                              ? "rgba(99,102,241,0.06)"
                              : "transparent",
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              id="marketplace-sort"
              className="w-full sm:w-auto px-5 py-3.5 text-sm rounded-full outline-none"
              style={{
                background: "var(--glass-2-bg)",
                border: "1px solid var(--glass-2-border)",
                color: "var(--text-primary)",
                backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                WebkitBackdropFilter:
                  "blur(var(--glass-2-blur)) saturate(160%)",
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option
                  key={o.value}
                  value={o.value}
                  style={{
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                  }}
                >
                  {o.label}
                </option>
              ))}
            </select>

            {/* Filters button — opens the sidebar as a bottom sheet on mobile; desktop sidebar is always visible */}
            <button
              id="filter-toggle"
              onClick={() => setMobileFiltersOpen(true)}
              className="w-full sm:w-auto lg:hidden flex items-center justify-center sm:justify-start gap-2 px-5 py-3.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all relative"
              style={{
                background: "var(--glass-2-bg)",
                border: "1px solid var(--border-gold)",
                backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                WebkitBackdropFilter:
                  "blur(var(--glass-2-blur)) saturate(160%)",
                color: "var(--gold-400)",
              }}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilters > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                  style={{ background: "#EF4444", color: "white" }}
                >
                  {activeFilters}
                </span>
              )}
            </button>
          </motion.div>

          {/* ══════════════════════════════
              MAIN LAYOUT: Sidebar + Grid
          ══════════════════════════════ */}
          <div className="flex gap-5 pb-24">
            {/* ── LEFT SIDEBAR FILTERS ── */}
            <motion.aside
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="shrink-0 hidden lg:flex flex-col gap-0"
              style={{
                width: 230,
                background: "var(--glass-2-bg)",
                border: "1px solid var(--glass-2-border)",
                borderRadius: "var(--radius-2xl)",
                backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                WebkitBackdropFilter:
                  "blur(var(--glass-2-blur)) saturate(160%)",
                boxShadow: "var(--glass-2-highlight)",
                height: "fit-content",
                position: "sticky",
                top: 84,
                overflow: "hidden",
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid var(--glass-1-border)" }}
              >
                <span
                  className="font-semibold text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  Filters
                </span>
                {activeFilters > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-[11px] font-semibold transition-colors"
                    style={{ color: "var(--gold-400)" }}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="p-5 space-y-6">{filterContent}</div>
            </motion.aside>

            {/* ── MOBILE FILTER BOTTOM SHEET ── */}
            <AnimatePresence>
              {mobileFiltersOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setMobileFiltersOpen(false)}
                    className="lg:hidden fixed inset-0 z-[60]"
                    style={{
                      background: "rgba(15,23,42,0.5)",
                      backdropFilter: "blur(4px) saturate(160%)",
                    }}
                  />
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 32 }}
                    className="glass-fixed lg:hidden fixed bottom-0 inset-x-0 z-[61] max-h-[85vh] overflow-y-auto"
                    style={{
                      background: "var(--glass-3-bg)",
                      border: "1px solid var(--glass-3-border)",
                      borderTopLeftRadius: "var(--radius-xl)",
                      borderTopRightRadius: "var(--radius-xl)",
                      backdropFilter:
                        "blur(var(--glass-3-blur)) saturate(160%)",
                      WebkitBackdropFilter:
                        "blur(var(--glass-3-blur)) saturate(160%)",
                      boxShadow: "0 -20px 50px rgba(15,23,42,0.08)",
                    }}
                  >
                    <div
                      className="flex items-center justify-between px-5 py-4"
                      style={{
                        borderBottom: "1px solid var(--glass-1-border)",
                      }}
                    >
                      <span
                        className="font-semibold text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Filters
                      </span>
                      <div className="flex items-center gap-4">
                        {activeFilters > 0 && (
                          <button
                            onClick={clearAll}
                            className="text-[11px] font-semibold transition-colors"
                            style={{ color: "var(--gold-400)" }}
                          >
                            Clear All
                          </button>
                        )}
                        <button
                          onClick={() => setMobileFiltersOpen(false)}
                          aria-label="Close filters"
                        >
                          <X
                            className="w-4 h-4"
                            style={{ color: "var(--text-secondary)" }}
                          />
                        </button>
                      </div>
                    </div>
                    <div className="p-5 space-y-6">{filterContent}</div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* ── RIGHT: GRID ── */}
            <div className="flex-1 min-w-0">
              {/* Results count */}
              {!loading && (
                <div className="flex items-center justify-between mb-5">
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span
                      className="font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {filtered.length}
                    </span>{" "}
                    {filtered.length === 1 ? "property" : "properties"} found
                    {activeFilters > 0 && (
                      <button
                        onClick={clearAll}
                        className="ml-3 text-xs inline-flex items-center gap-1"
                        style={{ color: "var(--sapphire-500)" }}
                      >
                        <X className="w-3 h-3" /> Clear filters
                      </button>
                    )}
                  </p>
                </div>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "rgba(37,99,235,0.06)",
                      border: "1px solid rgba(37,99,235,0.10)",
                    }}
                  >
                    <Building2
                      className="w-7 h-7 animate-pulse"
                      style={{ color: "var(--sapphire-500)" }}
                    />
                  </div>
                  <p className="text-sm" style={{ color: "#475569" }}>
                    Loading properties…
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "rgba(37,99,235,0.06)",
                      border: "1px solid rgba(37,99,235,0.10)",
                    }}
                  >
                    <Building2
                      className="w-8 h-8 opacity-40"
                      style={{ color: "var(--sapphire-500)" }}
                    />
                  </div>
                  <p className="text-sm" style={{ color: "#475569" }}>
                    No properties match your filters.
                  </p>
                  <button onClick={clearAll} className="btn-secondary text-xs">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((p, i) => (
                    <PropertyCard
                      key={p.id}
                      property={p}
                      index={i}
                      liked={likedIds.has(p.id)}
                      onLike={() => toggleLike(p.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
