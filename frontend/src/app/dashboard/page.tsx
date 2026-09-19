"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sprout,
  MessageSquare,
  Camera,
  Store,
  TrendingUp,
  ShoppingBag,
  Bell,
  ChevronRight,
  Sparkles,
  MapPin,
  Layers,
  Droplets,
  FlaskConical,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import {
  useCurrentUser,
  useFarms,
  useFarmInsights,
  useWeather,
  useNearbyStores,
  useMarkets,
  useNotifications,
} from "@/hooks/useQueries";
import { useLanguage } from "@/lib/LanguageContext";
import { getAuthToken } from "@/lib/api";
import { WeatherCard } from "@/components/weather/WeatherCard";
import { FarmMemoryCard } from "@/components/farm/FarmMemoryCard";
import { PersonalizedActionCards } from "@/components/farm/PersonalizedActionCards";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();

  // Auth Guard
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: farms, isLoading: farmsLoading } = useFarms();
  const { data: weather, isLoading: weatherLoading } = useWeather();
  const { data: stores, isLoading: storesLoading } = useNearbyStores();
  const { data: markets, isLoading: marketsLoading } = useMarkets("Wheat");
  const { data: notifs, isLoading: notifsLoading } = useNotifications();

  const primaryFarm = farms && farms.length > 0 ? farms[0] : null;
  const { data: farmInsights, isLoading: insightsLoading } = useFarmInsights(primaryFarm?.id);

  const nearestStore = stores && stores.length > 0 ? stores[0] : null;
  const topMarket = markets && markets.length > 0 ? markets[0] : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Farmer Greeting Banner */}
      <div className="bg-gradient-to-r from-agri-900 via-agri-800 to-agri-700 text-white rounded-3xl p-5 sm:p-7 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-agri-200 text-xs sm:text-sm font-semibold mb-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {user?.location || "सीहोर, मध्य प्रदेश"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t.dashboard.greeting}, {user ? user.name.split(" ")[0] : "किसान साथी"} 👋
            </h1>
            <p className="text-agri-100 text-sm mt-1 max-w-xl font-medium flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {lang === "hi"
                  ? "KisanOS remembers your farm — आपके खेत का डेटा सुरक्षित है और आज के लिए विश्लेषण तैयार है।"
                  : "KisanOS remembers your farm — Your farm memory is active and today's insights are ready."}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/advisor">
              <Button variant="secondary" size="md" className="font-bold gap-1.5 shadow-sm text-sm">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{t.dashboard.askAi}</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative background wheat pattern */}
        <div className="absolute right-0 bottom-0 translate-x-4 translate-y-6 opacity-10 pointer-events-none text-white">
          <Sprout className="w-48 h-48" />
        </div>
      </div>

      {/* 2 & 3. Current Farm Context (Name, Area, Soil, pH, Irrigation, Crop, Stage) */}
      {farmsLoading ? (
        <Skeleton className="h-44 w-full rounded-2xl" />
      ) : primaryFarm ? (
        <Card className="border-agri-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center font-bold">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base sm:text-lg text-slate-900 font-extrabold">
                    {primaryFarm.name}
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] font-semibold text-slate-500">
                    प्राथमिक खेत
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-medium">{primaryFarm.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-xs font-bold px-2.5 py-1">
                {primaryFarm.current_crop || "Wheat"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block">रकबा (Area)</span>
                <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 block">
                  {primaryFarm.area_acres} एकड़
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block">वर्तमान फसल (Crop)</span>
                <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 block truncate">
                  {primaryFarm.current_crop || "Wheat"}
                </span>
              </div>
              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                <span className="text-[11px] font-semibold text-emerald-800 block">फसल अवस्था (Stage)</span>
                <span className="text-base sm:text-lg font-black text-emerald-900 mt-0.5 block truncate">
                  {primaryFarm.current_stage || "Tillering"}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block">मिट्टी (Soil)</span>
                <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 block truncate">
                  {primaryFarm.soil_type.split("(")[0]}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block">मिट्टी pH</span>
                <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 block">
                  {primaryFarm.soil_ph || "6.8"}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block">सिंचाई साधन</span>
                <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 block truncate">
                  {primaryFarm.irrigation_type}
                </span>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">
                मिट्टी: {primaryFarm.soil_type} • pH: {primaryFarm.soil_ph || "6.8"} • सिंचाई: {primaryFarm.irrigation_type}
              </span>
              <Link
                href="/farm"
                className="text-agri-700 hover:text-agri-900 font-bold flex items-center gap-1 hover:underline"
              >
                <span>विस्तृत खेत प्रोफाइल</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-slate-300 p-8 text-center bg-white">
          <p className="text-slate-600 font-medium">कोई खेत पंजीकृत नहीं है।</p>
          <Link href="/farm" className="mt-3 inline-block">
            <Button variant="primary" size="sm">खेत जोड़ें</Button>
          </Link>
        </Card>
      )}

      {/* 4. Important Weather Advisory */}
      <div id="weather">
        <WeatherCard weather={weather} />
      </div>

      {/* 5. Personalized AI Insight & Personalized Action Cards */}
      <PersonalizedActionCards
        actions={farmInsights?.actions}
        farmSummary={farmInsights?.farm_summary}
        insights={farmInsights?.insights}
        isLoading={insightsLoading}
      />

      {/* 6. Farm Memory (Previous Season Timeline/Cards) */}
      {primaryFarm && primaryFarm.histories && (
        <FarmMemoryCard histories={primaryFarm.histories} farmId={primaryFarm.id} />
      )}

      {/* 7. Crop Monitoring & Quick Action Dial */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
          {t.dashboard.quickActions} (त्वरित सेवाएं)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/monitor" className="block">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-500 hover:shadow-xs transition-all flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900 block">{t.dashboard.scanCrop}</span>
                <span className="text-[11px] text-slate-500 font-medium">पत्ती व लक्षण जांच</span>
              </div>
            </div>
          </Link>

          <Link href="/advisor" className="block">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-agri-500 hover:shadow-xs transition-all flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900 block">{t.dashboard.askAi}</span>
                <span className="text-[11px] text-slate-500 font-medium">रोग व पोषण सलाह</span>
              </div>
            </div>
          </Link>

          <Link href="/stores" className="block">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-500 hover:shadow-xs transition-all flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900 block">{t.dashboard.findStores}</span>
                <span className="text-[11px] text-slate-500 font-medium">खाद-बीज भंडार</span>
              </div>
            </div>
          </Link>

          <Link href="/harvest" className="block">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-amber-500 hover:shadow-xs transition-all flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900 block">{t.dashboard.sellHarvest}</span>
                <span className="text-[11px] text-slate-500 font-medium">लॉट व खरीदार</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 8 & 9. Nearby Stores & Market Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 8. Nearby Stores Card */}
        <Card className="border-slate-200 bg-white shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <CardTitle className="text-base font-bold text-slate-900">
                  {t.dashboard.storesTitle}
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] text-slate-500">
                डेमो डेटा
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-3 flex-1">
            {nearestStore ? (
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="font-extrabold text-base text-slate-900">{nearestStore.name}</span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                    {nearestStore.distance_km} किमी
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{nearestStore.address}</p>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{nearestStore.inventory_items_count || 4} {t.dashboard.storesAvailable} (DAP, यूरिया, टिल्ट)</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">दुकानों की जानकारी उपलब्ध नहीं है।</p>
            )}
          </CardContent>

          <div className="p-4 pt-0 border-t border-slate-100 flex justify-end">
            <Link
              href="/stores"
              className="text-xs font-bold text-agri-700 hover:text-agri-900 flex items-center gap-1 hover:underline"
            >
              <span>{t.dashboard.viewStore} & मैप</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* 9. Live Mandi Snapshot Card */}
        <Card className="border-slate-200 bg-white shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <CardTitle className="text-base font-bold text-slate-900">
                  {t.dashboard.marketTitle}
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] text-slate-500">
                मंडी बेंचमार्क
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-3 flex-1">
            {topMarket ? (
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="font-extrabold text-base text-slate-900">{topMarket.crop}</span>
                  <span className="text-lg font-extrabold text-emerald-700">
                    {formatCurrency(topMarket.price_per_quintal)} <span className="text-xs text-slate-500 font-normal">/ Q</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{topMarket.name}</p>
                <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <span>खरीदार: {topMarket.buyer_name?.slice(0, 26)}...</span>
                  <span className="text-slate-900 font-bold">{topMarket.available_quantity} Q मांग</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">मंडी भाव उपलब्ध नहीं है।</p>
            )}
          </CardContent>

          <div className="p-4 pt-0 border-t border-slate-100 flex justify-end">
            <Link
              href="/market"
              className="text-xs font-bold text-agri-700 hover:text-agri-900 flex items-center gap-1 hover:underline"
            >
              <span>{t.dashboard.viewAllMarkets}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* 10. Notifications Section */}
      <div id="notifications">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t.dashboard.notificationsTitle}
          </h3>
          {notifs && notifs.unread_count > 0 && (
            <Badge variant="danger" className="text-[10px]">
              {notifs.unread_count} अपठित (Unread)
            </Badge>
          )}
        </div>

        <div className="space-y-2.5">
          {notifs && notifs.notifications.length > 0 ? (
            notifs.notifications.slice(0, 3).map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                  n.read
                    ? "bg-white/80 border-slate-200 text-slate-700"
                    : "bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-2xs"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 text-slate-700">
                  <Bell className="w-4 h-4 text-agri-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-sm text-slate-900 block truncate">
                      {n.title}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-snug font-medium">
                    {n.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              कोई नई सूचना नहीं है।
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
