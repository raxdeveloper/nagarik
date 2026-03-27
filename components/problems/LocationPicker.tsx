"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { NEPAL_CENTER } from "@/lib/constants";
import { LocateFixed, Loader2 } from "lucide-react";

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

export function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const [locating, setLocating] = useState(false);
  
  // Keep onChange ref updated
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (typeof window === "undefined" || mapRef.current) return;

    const map = L.map("location-picker-map", {
      center: lat !== 0 ? [lat, lng] : NEPAL_CENTER,
      zoom: lat !== 0 && lat !== NEPAL_CENTER[0] ? 15 : 7,
      zoomControl: true,
      attributionControl: false
    });

    mapRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
    }).addTo(map);

    const icon = L.divIcon({
      html: `<div style="width:18px;height:18px;background:#DC143C;border-radius:50%;border:3px solid white;box-shadow:0 0 15px rgba(220,20,60,0.9);"></div>`,
      className: "location-marker",
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    markerRef.current = L.marker([lat || NEPAL_CENTER[0], lng || NEPAL_CENTER[1]], { icon, draggable: true }).addTo(map);
    
    markerRef.current.on("dragend", (e: L.DragEndEvent) => {
      const target = e.target as L.Marker;
      const { lat: newLat, lng: newLng } = target.getLatLng();
      onChangeRef.current(newLat, newLng);
    });

    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat: newLat, lng: newLng } = e.latlng;
      markerRef.current?.setLatLng([newLat, newLng]);
      onChangeRef.current(newLat, newLng);
    });

    // Automatically try to locate user on mount if they haven't picked a location yet
    if (lat === NEPAL_CENTER[0] && "geolocation" in navigator) {
      handleLocateMe();
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleLocateMe = () => {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        mapRef.current?.setView([latitude, longitude], 16);
        markerRef.current?.setLatLng([latitude, longitude]);
        onChangeRef.current(latitude, longitude);
        setLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="relative w-full h-full rounded-[inherit] overflow-hidden">
      <div id="location-picker-map" className="w-full h-full z-0" />
      
      {/* Locate Me Button Overlay */}
      <button 
        onClick={(e) => { e.preventDefault(); handleLocateMe(); }}
        disabled={locating}
        className="absolute bottom-4 left-4 z-[400] bg-black/80 backdrop-blur-md border border-white/20 text-white p-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold hover:bg-[#DC143C] transition-all"
      >
        {locating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} className="text-[#DC143C] group-hover:text-white" />}
        <span>{locating ? "Locating..." : "Use My Location"}</span>
      </button>
    </div>
  );
}
