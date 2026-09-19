"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Store as StoreIcon, MapPin, Phone, ChevronRight, ShieldCheck, Info } from "lucide-react";
import { useNearbyStores, useFarms } from "@/hooks/useQueries";
import { useLanguage } from "@/lib/LanguageContext";
import { StoreMap } from "@/components/stores/StoreMap";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StoresPage() {
  const { t } = useLanguage();
  const { data: farms } = useFarms();
  const farm = farms && farms.length > 0 ? farms[0] : null;

  const farmLat = farm?.latitude || 23.2033;
  const farmLon = farm?.longitude || 77.0844;

  const { data: stores = [], isLoading } = useNearbyStores(farmLat, farmLon, 25);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <StoreIcon className="w-7 h-7 text-blue-700" />
          <span>{t.stores.title}</span>
        </h1>
        <p className="text-sm text-slate-600 font-medium mt-1">
          {t.stores.subtitle}
        </p>
      </div>

      {/* Prototype Data Notice */}
      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="font-medium">{t.stores.prototypeNotice}</span>
        </div>
        <Badge variant="outline" className="text-[10px]">सीडेड डेमो</Badge>
      </div>

      {/* Interactive Leaflet Store Map */}
      <StoreMap stores={stores} farmerLat={farmLat} farmerLon={farmLon} />

      {/* Store Listings */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          उपलब्ध कृषि केंद्र ({stores.length})
        </h3>

        {stores.map((store) => (
          <Card key={store.id} className="border-slate-200 bg-white shadow-xs hover:border-blue-300 transition-all">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-black text-slate-900">{store.name}</h4>
                    {store.verified && (
                      <Badge variant="success" className="text-[10px]">प्रमाणित विक्रेता</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{store.address}</span>
                    {store.distance_km !== undefined && (
                      <span className="font-extrabold text-blue-700 ml-1">
                        • {store.distance_km} किमी दूर
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {store.phone && (
                    <a href={`tel:${store.phone}`}>
                      <Button variant="outline" size="sm" className="gap-1 text-xs">
                        <Phone className="w-3.5 h-3.5 text-agri-700" />
                        <span>कॉल करें</span>
                      </Button>
                    </a>
                  )}
                  <Link href={`/stores/${store.id}`}>
                    <Button variant="primary" size="sm" className="gap-1 text-xs">
                      <span>{t.stores.viewInventory}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
