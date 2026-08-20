"use client";

import { useEffect, useRef, useState } from "react";
import { X, Check, MapPin, Navigation, Search, Loader2 } from "lucide-react";
import L from "leaflet";
import axios from "axios";

interface LocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (lat: number, lon: number) => void;
  initialLat?: number;
  initialLon?: number;
}

export default function LocationMapModal({
  isOpen,
  onClose,
  onSelectLocation,
  initialLat = 51.5074,
  initialLon = -0.1278,
}: LocationMapModalProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lon: number }>({
    lat: initialLat,
    lon: initialLon,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [locationName, setLocationName] = useState<string>("Selected Location");

  // Sync initial coords when props update
  useEffect(() => {
    if (initialLat && initialLon) {
      setSelectedCoords({ lat: initialLat, lon: initialLon });
    }
  }, [initialLat, initialLon]);

  // Reverse geocode lat/lon to friendly name
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await axios.get("https://nominatim.openstreetmap.org/reverse", {
        params: { lat, lon, format: "json" },
        headers: { "User-Agent": "WeatherDashboardApp/1.0" },
      });
      if (res.data && res.data.address) {
        const addr = res.data.address;
        const name =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.county ||
          addr.state ||
          addr.country ||
          "Selected Location";
        setLocationName(name);
      }
    } catch (e) {
      setLocationName(`${lat.toFixed(2)}°, ${lon.toFixed(2)}°`);
    }
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure modal DOM is mounted
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      // Custom glowing cyan pin marker icon
      const customIcon = L.divIcon({
        className: "custom-map-pin-container",
        html: `<div class="relative flex items-center justify-center cursor-pointer">
          <span class="absolute w-10 h-10 bg-cyan-400/40 rounded-full animate-ping"></span>
          <div class="w-7 h-7 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full border-2 border-white shadow-xl shadow-cyan-500/80 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      if (!leafletMapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [selectedCoords.lat, selectedCoords.lon],
          zoom: 6,
          zoomControl: false,
        });

        // Add CartoDB Dark Matter tiles
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 19,
          }
        ).addTo(map);

        L.control.zoom({ position: "topright" }).addTo(map);

        const marker = L.marker([selectedCoords.lat, selectedCoords.lon], {
          icon: customIcon,
          draggable: true,
        }).addTo(map);

        markerRef.current = marker;

        // Map click event
        map.on("click", (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          setSelectedCoords({ lat, lon: lng });
          marker.setLatLng([lat, lng]);
          reverseGeocode(lat, lng);
        });

        // Drag marker event
        marker.on("dragend", () => {
          const position = marker.getLatLng();
          setSelectedCoords({ lat: position.lat, lon: position.lng });
          reverseGeocode(position.lat, position.lng);
        });

        leafletMapRef.current = map;
        reverseGeocode(selectedCoords.lat, selectedCoords.lon);
      } else {
        leafletMapRef.current.setView([selectedCoords.lat, selectedCoords.lon], 6);
        if (markerRef.current) {
          markerRef.current.setLatLng([selectedCoords.lat, selectedCoords.lon]);
        }
      }

      leafletMapRef.current?.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);


  // Clean up map instance when component unmounts
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // In-map search geocoding handler
  const handleMapSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
        params: { name: searchQuery.trim(), count: 1, language: "en", format: "json" },
      });

      if (res.data.results && res.data.results.length > 0) {
        const item = res.data.results[0];
        const lat = item.latitude;
        const lon = item.longitude;
        setSelectedCoords({ lat, lon });
        setLocationName(`${item.name}${item.country ? `, ${item.country}` : ""}`);

        if (leafletMapRef.current) {
          leafletMapRef.current.flyTo([lat, lon], 9);
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lon]);
        }
      }
    } catch (err) {
      // ignore
    } finally {
      setSearching(false);
    }
  };

  const handleConfirm = () => {
    onSelectLocation(selectedCoords.lat, selectedCoords.lon);
    onClose();
  };

  const handleMyCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setSelectedCoords({ lat: latitude, lon: longitude });
        reverseGeocode(latitude, longitude);

        if (leafletMapRef.current) {
          leafletMapRef.current.flyTo([latitude, longitude], 10);
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        }
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-lg animate-fade-in">
      <div className="relative w-full max-w-5xl glass-panel rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col h-[85vh] max-h-[750px]">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-4 border-b border-white/10 bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Interactive World Map
              </h3>
              <p className="text-xs text-slate-400">
                Click or drag the pin anywhere to select weather coordinates
              </p>
            </div>
          </div>

          {/* Search Location Inside Map */}
          <form onSubmit={handleMapSearch} className="flex items-center gap-2 flex-1 max-w-md sm:mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city to fly map (e.g. Rome)..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs text-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1 transition-all"
            >
              {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Go"}
            </button>
          </form>

          <button
            onClick={onClose}
            className="self-end sm:self-center p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Body Container */}
        <div className="relative flex-1 w-full bg-slate-950 overflow-hidden cursor-crosshair">
          <div
            ref={mapContainerRef}
            className="w-full h-full min-h-[350px] z-10 pointer-events-auto"
            style={{ width: "100%", height: "100%" }}
          />

          {/* Floating Action: Find My Location */}
          <button
            type="button"
            onClick={handleMyCurrentLocation}
            className="absolute bottom-4 left-4 z-[500] px-3.5 py-2 glass-panel text-xs text-cyan-300 hover:text-white rounded-xl flex items-center gap-2 border border-white/20 shadow-xl transition-all cursor-pointer hover:scale-105"
          >
            <Navigation className="w-4 h-4 text-cyan-400" /> Center My Location
          </button>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/10 bg-slate-900/90 shrink-0">
          <div className="text-xs text-slate-300 flex flex-wrap items-center gap-3">
            <span className="text-slate-200 font-semibold flex items-center gap-1">
              📍 <span className="text-white font-bold">{locationName}</span>
            </span>
            <span className="glass-chip px-2.5 py-0.5 rounded-lg border border-white/10 text-[11px]">
              Lat: <strong className="text-cyan-400">{selectedCoords.lat.toFixed(4)}°</strong>
            </span>
            <span className="glass-chip px-2.5 py-0.5 rounded-lg border border-white/10 text-[11px]">
              Lon: <strong className="text-cyan-400">{selectedCoords.lon.toFixed(4)}°</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl glass-button text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
            >
              <Check className="w-4 h-4" /> Select This Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
