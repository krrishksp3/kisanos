"use client";

import React from "react";
import Link from "next/link";
import {
  CloudRain,
  Sprout,
  History,
  Store,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Database,
  Info,
  ShieldCheck,
} from "lucide-react";
import { FarmActionCard } from "@/types";
import { Badge } from "@/components/ui/badge";

interface PersonalizedActionCardsProps {
  actions?: FarmActionCard[];
  farmSummary?: string;
  insights?: string[];
  isLoading?: boolean;
}

export function PersonalizedActionCards({
  actions = [],
  farmSummary,
  insights = [],
  isLoading,
}: PersonalizedActionCardsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-48 bg-slate-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  const getActionIcon = (category: string) => {
    if (category.includes("मौसम") || category.toLowerCase().includes("weather")) {
      return <CloudRain className="w-5 h-5 text-sky-600" />;
    }
    if (category.includes("फसल") || category.toLowerCase().includes("crop")) {
      return <Sprout className="w-5 h-5 text-emerald-600" />;
    }
    if (category.includes("मेमोरी") || category.toLowerCase().includes("memory")) {
      return <History className="w-5 h-5 text-amber-600" />;
    }
    if (category.includes("खाद") || category.includes("दुकान") || category.toLowerCase().includes("input")) {
      return <Store className="w-5 h-5 text-blue-600" />;
    }
    return <TrendingUp className="w-5 h-5 text-purple-600" />;
  };

  const getSourceBadge = (sourceType: string) => {
    switch (sourceType) {
      case "database_records":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
            <Database className="w-2.5 h-2.5 text-emerald-700" />
            डेटाबेस रिकॉर्ड
          </span>
        );
      case "agronomy_knowledge":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-800 bg-purple-100/80 px-2 py-0.5 rounded-full border border-purple-200">
            <Sparkles className="w-2.5 h-2.5 text-purple-700" />
            एआई कृषि परामर्श
          </span>
        );
      case "weather_advisory":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
            <Info className="w-2.5 h-2.5 text-amber-700" />
            मौसम पूर्वानुमान
          </span>
        );
      case "seeded_demo":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            <Info className="w-2.5 h-2.5 text-slate-400" />
            डेमो डेटा
          </span>
        );
    }
  };

  const getActionLink = (category: string) => {
    if (category.includes("मौसम")) return "#weather";
    if (category.includes("फसल")) return "/advisor";
    if (category.includes("मेमोरी")) return "/farm/history";
    if (category.includes("खाद") || category.includes("दुकान")) return "/stores";
    return "/market";
  };

  return (
    <div className="space-y-4">
      {/* AI Grounded Farm Summary Bar */}
      {farmSummary && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-agri-800 to-agri-900 text-white shadow-sm border border-emerald-700/50">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  व्यक्तिगत खेत विश्लेषण (Personalized Farm Insight)
                </span>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">
                  Farm Memory सक्रिय
                </span>
              </div>
              <p className="text-sm font-medium text-emerald-50 leading-relaxed">
                {farmSummary}
              </p>
              {insights.length > 0 && (
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-100">
                  {insights.slice(0, 2).map((ins, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-black/20 p-2 rounded-lg">
                      <span className="text-amber-300 font-bold">✓</span>
                      <span>{ins}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Cards Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-agri-700" />
            <span>आज के व्यक्तिगत सुझाव (Personalized Action Cards)</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            खेत के डेटा, फसल अवस्था, मौसम व मंडी के आधार पर तैयार
          </p>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {actions.map((act, index) => {
          const actionLink = getActionLink(act.category);
          return (
            <div
              key={index}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-agri-400 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      {getActionIcon(act.category)}
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      {act.category.split("(")[0].trim()}
                    </span>
                  </div>
                  {getSourceBadge(act.source_type)}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {act.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                    {act.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">
                  {act.badge}
                </span>
                <Link
                  href={actionLink}
                  className="text-xs font-bold text-agri-700 hover:text-agri-900 flex items-center gap-0.5 hover:underline"
                >
                  <span>कार्रवाई करें</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
