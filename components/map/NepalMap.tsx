"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useStore } from "@/lib/store/useStore";
import { CATEGORY_CONFIG, NEPAL_CENTER, NEPAL_DEFAULT_ZOOM, PROVINCE_COLORS } from "@/lib/constants";
import { Problem } from "@/lib/supabase/database.types";

interface NepalMapProps {
  problems: Problem[];
}

interface GeoJSONFeature {
  properties?: {
    Province?: number;
    Province_Name?: string;
    name?: string;
  };
}

export function NepalMap({ problems }: NepalMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const { setSelectedProblemId } = useStore();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mapRef.current) return;

    // Define exact bounding box for Nepal
    const nepalBounds = L.latLngBounds(
      [26.347, 80.058], // Southwest corner
      [30.422, 88.201]  // Northeast corner
    );

    const map = L.map("nepal-map", {
      center: nepalBounds.getCenter(),
      zoom: NEPAL_DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true,
      maxBounds: nepalBounds,      // Restrict map to Nepal bounds
      maxBoundsViscosity: 0.8,     // Bounciness when dragging out of bounds
      minZoom: 6,                  // Prevent zooming out to see the whole world
    });

    mapRef.current = map;

    // Dark tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
      minZoom: 6,
      bounds: nepalBounds          // Restrict tiles to Nepal
    }).addTo(map);

    // Zoom control top-right
    L.control.zoom({ position: "topright" }).addTo(map);

    // Load Nepal province GeoJSON
    fetch("/data/nepal-provinces.geojson")
      .then((r) => r.json())
      .then((geojson) => {
        L.geoJSON(geojson, {
          style: (feature) => {
            const f = feature as GeoJSONFeature;
            const idx = (f?.properties?.Province || 1) - 1;
            return {
              color: "rgba(255,255,255,0.03)", // Barely visible borders
              weight: 1,
              fillColor: PROVINCE_COLORS[idx % PROVINCE_COLORS.length],
              fillOpacity: 0.08, // Very subtle minimalist base
            };
          },
          onEachFeature: (feature, layer) => {
            const f = feature as GeoJSONFeature;
            const name = f?.properties?.Province_Name || f?.properties?.name || "";
            layer.bindTooltip(`<div style="font-family:Inter;font-size:11px;color:#e0e0ff;background:rgba(10,10,20,0.9);border:1px solid rgba(255,255,255,0.1);padding:4px 8px;border-radius:6px;">${name}</div>`, {
              permanent: false, direction: "center", className: "leaflet-tooltip-custom",
            });
            // Removed disruptive hover styling to keep it minimalist
          },
        }).addTo(map);
      })
      .catch(() => console.log("Province GeoJSON not loaded yet"));

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when problems change
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    problems.forEach((problem) => {
      const config = CATEGORY_CONFIG[problem.category] || CATEGORY_CONFIG.infrastructure;
      const size = Math.max(12, Math.min(30, problem.severity * 2.5));
      const isSolved = problem.status === "solved";

      const markerHtml = `
        <div style="
          width:${size}px;height:${size}px;
          background:${isSolved ? "#22c55e" : config.markerColor};
          border-radius:50%;
          border:2px solid rgba(255,255,255,0.6);
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;
          box-shadow:0 0 ${size / 2}px ${isSolved ? "rgba(34,197,94,0.5)" : config.markerColor + "80"};
          transition:all 0.2s ease;
          font-size:${isSolved ? "8px" : "0"};
          color:white;font-weight:bold;
        ">${isSolved ? "✓" : ""}</div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: "custom-marker",
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const popupContent = `
        <div style="min-width:220px;font-family:Inter;color:#e0e0ff;">
          <div style="font-size:10px;color:${config.markerColor};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">${config.label}</div>
          <div style="font-weight:600;font-size:14px;margin-bottom:6px;line-height:1.3;">${problem.title}</div>
          <div style="font-size:11px;color:#888;margin-bottom:10px;line-height:1.4;">${problem.description?.slice(0, 120)}...</div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
            <span style="font-size:10px;padding:2px 8px;border-radius:4px;background:${config.markerColor}20;color:${config.markerColor};">Severity ${problem.severity}/10</span>
            <span style="font-size:10px;padding:2px 8px;border-radius:4px;background:rgba(255,255,255,0.05);color:#888;">${problem.status}</span>
          </div>
          <div style="font-size:11px;color:#666;margin-bottom:10px;">↑ ${problem.upvotes} upvotes · ${problem.view_count} views</div>
          <button onclick="window.nagrikaSelectProblem('${problem.id}')" style="width:100%;padding:8px;background:#DC143C;color:white;border:none;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;font-family:Inter;">
            View Full Details →
          </button>
        </div>
      `;

      const marker = L.marker([problem.latitude, problem.longitude], { icon })
        .bindPopup(popupContent, { maxWidth: 260, className: "nagrika-popup" })
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });

    // Global callback for popup button
    (window as unknown as { nagrikaSelectProblem: (id: string) => void }).nagrikaSelectProblem = (id: string) => {
      setSelectedProblemId(id);
      mapRef.current?.closePopup();
    };
  }, [problems, setSelectedProblemId]);

  return <div id="nepal-map" className="w-full h-full" />;
}
