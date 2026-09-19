"use client";

import React from "react";
import { CloudRain, Wind, Droplets, AlertTriangle, SunMedium, ShieldAlert } from "lucide-react";
import { WeatherResponse } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/LanguageContext";

export function WeatherCard({ weather }: { weather?: WeatherResponse }) {
  const { t } = useLanguage();

  if (!weather) {
    return (
      <Card className="border-emerald-100 bg-white">
        <CardContent className="p-6 text-center text-slate-500">
          मौसम जानकारी लोड हो रही है...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/40 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-emerald-100/60 bg-white/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-agri-100 text-agri-800 flex items-center justify-center">
              <SunMedium className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg text-slate-900 font-bold">
                {t.dashboard.weatherTitle}
              </CardTitle>
              <p className="text-xs text-slate-500 font-medium">{weather.location}</p>
            </div>
          </div>
          <Badge variant="warning" className="text-[10px]">
            {weather.disclaimer}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Main Temperature & Metric Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {weather.current_temp_c}°C
            </span>
            <span className="text-sm font-semibold text-slate-700">
              {weather.condition_hi || weather.condition}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 bg-white/80 px-3 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1">
              <CloudRain className="w-4 h-4 text-blue-600" />
              <span>{weather.precipitation_prob}% वर्षा</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="w-4 h-4 text-cyan-600" />
              <span>{weather.humidity_percent}% नमी</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="w-4 h-4 text-slate-600" />
              <span>{weather.wind_speed_kmh} किमी/घंटा</span>
            </div>
          </div>
        </div>

        {/* Rain Advisory Callout */}
        {weather.postpone_irrigation && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-300/80 text-amber-950 text-xs sm:text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-900">
                {t.dashboard.advisoryAlert}:
              </span>
              <p className="mt-0.5 text-amber-800 leading-snug font-medium">
                {weather.primary_advisory}
              </p>
            </div>
          </div>
        )}

        {/* 5-Day Mini Forecast */}
        <div className="pt-1">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            5-दिवसीय पूर्वानुमान
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {weather.forecast_5day.map((f, i) => (
              <div
                key={i}
                className="bg-white/90 border border-slate-200/80 rounded-xl p-2.5 text-center flex flex-col justify-between shadow-2xs"
              >
                <span className="text-xs font-bold text-slate-800 block truncate">{f.day}</span>
                <div className="my-1">
                  <span className="text-sm font-extrabold text-slate-900 block">{f.temp_max_c}°</span>
                  <span className="text-[11px] font-medium text-slate-500 block">{f.temp_min_c}°C</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-blue-700">
                  <CloudRain className="w-3 h-3" />
                  <span>{f.precipitation_prob}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
