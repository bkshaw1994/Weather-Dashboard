"use client";

import { useEffect, useRef, useState } from "react";
import { X, Check, MapPin, Navigation } from "lucide-react";
import L from "leaflet";

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
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lon: number }>({
    lat: initialLat,
    lon: initialLon,
  });

  useEffect(() => {
    if (initialLat && initialLon) {
      setSelectedCoords({ lat: initialLat, lon: initialLon });
    }
  }, [initialLat, initialLon]);

  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    // Custom glowing cyan marker icon
    const customIcon = L.divIcon({
      className: "custom-map-pin",
      html: `<div class="relative flex items-center justify-center">
        <span class="absolute w-8 h-8 bg-cyan-500/40 rounded-full animate-ping"></span>
        <div class="w-6 h-6 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full border-2 border-white shadow-lg shadow-cyan-500/50 flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });

    // Initialize Leaflet map if not already created
    if (!leafletMapRef.current) {
      const map = L.map(mapRef.current, {
        center: [selectedCoords.lat, selectedCoords.lon],
        zoom: 6,
        zoomControl: false,
      });

      // Add CartoDB Dark Matter tile layer
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      // Add Zoom Control at top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Place initial marker
      const marker = L.marker([selectedCoords.lat, selectedCoords.lon], {
        icon: customIcon,
      }).addTo(map);
      markerRef.current = marker;

      // Handle map click
      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setSelectedCoords({ lat, lon: lng });
        marker.setLatLng([lat, lng]);
        map.panTo([lat, lng]);
      });

      leafletMapRef.current = map;
    } else {
      // Pan and set position
      leafletMapRef.current.setView([selectedCoords.lat, selectedCoords.lon], 6);
      if (markerRef.current) {
        markerRef.current.setLatLng([selectedCoords.lat, selectedCoords.lon]);
      }
      setTimeout(() => {
        leafletMapRef.current?.invalidateSize();
      }, 200);
    }

    return () => {
      // Invalidate size on re-render
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);


  // Clean up map instance on modal unmount
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const handleConfirm = () => {
    onSelectLocation(selectedCoords.lat, selectedCoords.lon);
    onClose();
  };

  const handleMyCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setSelectedCoords({ lat: latitude, lon: longitude });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl glass-panel rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Select Location on Map
              </h3>
              <p className="text-xs text-slate-400">
                Click anywhere on the map to set target weather coordinates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Body */}
        <div className="relative flex-1 min-h-[380px] bg-slate-950">
          <div ref={mapRef} className="w-full h-full min-h-[380px] z-10" />

          {/* Quick Floating Action: Find My Location */}
          <button
            onClick={handleMyCurrentLocation}
            className="absolute bottom-4 left-4 z-20 px-3.5 py-2 glass-panel text-xs text-cyan-300 hover:text-white rounded-xl flex items-center gap-2 border border-white/20 shadow-lg transition-all"
          >
            <Navigation className="w-4 h-4 text-cyan-400" /> My Location
          </button>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/10 bg-slate-900/80">
          <div className="text-xs text-slate-300 flex items-center gap-3">
            <span className="glass-chip px-3 py-1 rounded-lg border border-white/10">
              Lat: <strong className="text-cyan-400">{selectedCoords.lat.toFixed(4)}</strong>
            </span>
            <span className="glass-chip px-3 py-1 rounded-lg border border-white/10">
              Lon: <strong className="text-cyan-400">{selectedCoords.lon.toFixed(4)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl glass-button text-xs font-semibold text-slate-300 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/30 flex items-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" /> Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
