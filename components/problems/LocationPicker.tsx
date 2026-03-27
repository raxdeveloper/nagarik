"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { NEPAL_CENTER } from "@/lib/constants";

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

export function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  
  // Keep onChange ref updated
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (typeof window === "undefined" || mapRef.current) return;

    const map = L.map("location-picker-map", {
      center: NEPAL_CENTER,
      zoom: 7,
      zoomControl: true,
    });

    mapRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "",
      subdomains: "abcd",
    }).addTo(map);

    const icon = L.divIcon({
      html: `<div style="width:16px;height:16px;background:#DC143C;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(220,20,60,0.8);"></div>`,
      className: "location-marker",
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
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

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng]);

  return <div id="location-picker-map" className="w-full h-full" />;
}
