"use client";

import React, { useEffect, useRef } from "react";
import { Store } from "@/types";

export function StoreMap({
  stores = [],
  farmerLat = 23.2033,
  farmerLon = 77.0844,
}: {
  stores: Store[];
  farmerLat?: number;
  farmerLon?: number;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Only run on browser
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      const L = (await import("leaflet")).default;

      // Import Leaflet CSS dynamically if not present
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current).setView([farmerLat, farmerLon], 13);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Farmer location marker (Green circle icon)
      const farmerIcon = L.divIcon({
        className: "custom-farmer-pin",
        html: `<div style="background-color:#15803d; color:white; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:3px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3); font-weight:bold; font-size:16px;">🌾</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      L.marker([farmerLat, farmerLon], { icon: farmerIcon })
        .addTo(map)
        .bindPopup("<b>आपका खेत (Your Farm)</b><br/>सीहोर, मध्य प्रदेश")
        .openPopup();

      // Store markers (Blue pin)
      stores.forEach((store) => {
        const storeIcon = L.divIcon({
          className: "custom-store-pin",
          html: `<div style="background-color:#0284c7; color:white; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:3px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3); font-size:14px;">🏪</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const popupContent = `
          <div style="font-family:sans-serif; min-width:160px;">
            <b style="color:#0f172a; font-size:14px;">${store.name}</b><br/>
            <span style="color:#475569; font-size:12px;">${store.address}</span><br/>
            <span style="color:#0284c7; font-weight:bold; font-size:12px;">${store.distance_km ? store.distance_km + ' किमी दूर' : ''}</span><br/>
            ${store.phone ? `<a href="tel:${store.phone}" style="display:inline-block; margin-top:4px; padding:3px 8px; background:#15803d; color:white; border-radius:4px; text-decoration:none; font-size:11px; font-weight:bold;">📞 कॉल करें</a>` : ''}
          </div>
        `;

        L.marker([store.latitude, store.longitude], { icon: storeIcon })
          .addTo(map)
          .bindPopup(popupContent);
      });
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [stores, farmerLat, farmerLon]);

  return (
    <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
