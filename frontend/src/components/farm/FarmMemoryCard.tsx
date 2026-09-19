"use client";

import React from "react";
import Link from "next/link";
import { History, TrendingUp, Sparkles, ChevronRight, Database, Sprout } from "lucide-react";
import { CropHistory } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";

export function FarmMemoryCard({ histories = [], farmId }: { histories: CropHistory[]; farmId?: string }) {
  const { t } = useLanguage();

  if (!histories || histories.length === 0) {
    return null;
  }

  const getSeasonIcon = (season: string) => {
    if (season.toLowerCase().includes("rabi") || season.includes("रबी")) {
      return "🌾";
    }
    return "🌱";
  };

  return (
    <Card className="border-amber-200/80 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/20 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-amber-100 bg-white/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base sm:text-lg text-slate-900 font-bold">
                  {t.dashboard.farmMemoryTitle} (Farm Memory)
                </CardTitle>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Database className="w-2.5 h-2.5 text-emerald-700" />
                  डेटाबेस रिकॉर्ड
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                पिछले सीजनों का वास्तविक उत्पादन, आय एवं प्रयुक्त खाद-दवाइयों का सुरक्षित रिकॉर्ड
              </p>
            </div>
          </div>
          <Badge variant="warning" className="text-[10px] gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>मेमोरी सुरक्षित</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Timeline Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {histories.slice(0, 2).map((item, index) => {
            const icon = getSeasonIcon(item.season);
            return (
              <div
                key={item.id || index}
                className="p-4 rounded-2xl bg-white border border-amber-200/70 shadow-2xs hover:border-amber-400 transition-all space-y-2.5 relative overflow-hidden"
              >
                {/* Season & Area */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <span className="text-sm">{icon}</span>
                    <span>{item.season}</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    रकबा: <span className="font-bold text-slate-800">{item.area} एकड़</span>
                  </span>
                </div>

                {/* Crop Name */}
                <div className="font-black text-base text-slate-900">
                  {item.crop_name}
                </div>

                {/* Yield & Revenue Stats */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block">कुल पैदावार</span>
                    <span className="text-sm font-black text-slate-900">
                      {item.yield_quintal} क्विंटल
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 font-semibold block">बिक्री आय</span>
                    <span className="text-sm font-black text-emerald-700">
                      {formatCurrency(item.selling_price)}
                    </span>
                  </div>
                </div>

                {/* Inputs Used */}
                {item.inputs_used && (
                  <div className="text-xs text-slate-600 bg-amber-50/40 p-2 rounded-lg border border-amber-100">
                    <span className="font-bold text-amber-950">प्रयुक्त खाद/दवा: </span>
                    <span>{item.inputs_used}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action link to /farm/history */}
        <div className="pt-1 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            &ldquo;KisanOS remembers my farm.&rdquo; — आपके खेत का डेटा हर नए सीजन में सलाह को बेहतर बनाता है।
          </span>
          <Link
            href="/farm/history"
            className="text-xs font-bold text-amber-900 hover:text-amber-800 flex items-center gap-1 hover:underline shrink-0 ml-2"
          >
            <span>सभी सीजन व चार्ट</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

