"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Sparkles,
  Send,
  AlertTriangle,
  CheckCircle2,
  Store,
  ShieldAlert,
  BookOpen,
  Info,
} from "lucide-react";
import { useFarms, useAdvisorMutation } from "@/hooks/useQueries";
import { useLanguage } from "@/lib/LanguageContext";
import { AdvisorResponse } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdvisorPage() {
  const { t, lang } = useLanguage();
  const { data: farms } = useFarms();
  const primaryFarm = farms && farms.length > 0 ? farms[0] : null;

  const [question, setQuestion] = useState("");
  const [activeAdvice, setActiveAdvice] = useState<AdvisorResponse | null>(null);

  const advisorMutation = useAdvisorMutation();

  const handleAsk = async (queryText?: string) => {
    const q = queryText || question;
    if (!q.trim()) return;

    try {
      const res = await advisorMutation.mutateAsync({
        farm_id: primaryFarm?.id,
        crop: primaryFarm?.current_crop || "Wheat",
        crop_stage: primaryFarm?.current_stage || "Tillering",
        message: q,
      });
      setActiveAdvice(res);
    } catch (err) {
      console.error("Advisor query failed:", err);
    }
  };

  const samplePrompts = [
    "गेहूं में पीली पत्तियां और रतुआ के लक्षण दिख रहे हैं, क्या करें?",
    "कल्ले फूटते समय कौन सा खाद और यूरिया डालना चाहिए?",
    "दीमक और माहू कीट नियंत्रण का सही समय क्या है?",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-agri-700" />
          <span>{t.advisor.title}</span>
        </h1>
        <p className="text-sm text-slate-600 font-medium mt-1">
          {t.advisor.subtitle}
        </p>
      </div>

      {/* Input Box Card */}
      <Card className="border-agri-300 shadow-md bg-white">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <textarea
              rows={2}
              className="flex-1 w-full rounded-xl border border-slate-300 p-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-agri-600 focus:border-transparent resize-none"
              placeholder={t.advisor.inputPlaceholder}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
            />
            <Button
              type="button"
              variant="primary"
              size="md"
              className="gap-2 font-bold shrink-0 self-end sm:self-auto h-auto min-h-[48px] px-6"
              onClick={() => handleAsk()}
              isLoading={advisorMutation.isPending}
            >
              <Send className="w-4 h-4" />
              <span>{t.advisor.askButton}</span>
            </Button>
          </div>

          {/* Quick Prompt Pills */}
          <div className="pt-1">
            <span className="text-xs font-bold text-slate-500 block mb-1.5">त्वरित सुझाव प्रश्न:</span>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestion(prompt);
                    handleAsk(prompt);
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 hover:bg-agri-100 text-slate-800 hover:text-agri-900 transition-colors text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Structured Advisor Response Display */}
      {advisorMutation.isPending && (
        <Card className="border-agri-200 bg-agri-50/50 p-8 text-center animate-pulse">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-agri-200 flex items-center justify-center text-agri-800 animate-spin">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="font-extrabold text-slate-800">{t.advisor.analyzing}</p>
            <p className="text-xs text-slate-500">खेत संदर्भ, मौसम एवं पास की दुकानों का स्टॉक संकलित किया जा रहा है...</p>
          </div>
        </Card>
      )}

      {activeAdvice && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <Card className="border-emerald-300 bg-white shadow-md overflow-hidden">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-agri-800 to-agri-700 text-white p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-lg">
                    🤖
                  </span>
                  <div>
                    <span className="text-xs text-agri-200 font-bold uppercase tracking-wider block">
                      {t.advisor.suspectedIssue}
                    </span>
                    <h2 className="text-lg sm:text-xl font-black">{activeAdvice.possible_issue}</h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      activeAdvice.severity === "high" || activeAdvice.severity === "critical"
                        ? "danger"
                        : activeAdvice.severity === "medium"
                        ? "warning"
                        : "success"
                    }
                    className="bg-white/20 text-white border-white/30 text-xs px-2.5 py-0.5"
                  >
                    जोखिम: {activeAdvice.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-white border-white/30 text-xs">
                    विश्वास: {(activeAdvice.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
            </div>

            <CardContent className="p-5 sm:p-6 space-y-5">
              {/* Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm font-medium text-slate-800 leading-relaxed">
                {activeAdvice.summary}
              </div>

              {/* Action Plan Guidance */}
              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-agri-700" />
                  <span>{t.advisor.guidance}</span>
                </h3>
                <ul className="space-y-1.5 pl-1">
                  {activeAdvice.general_guidance.map((item, i) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-agri-700 mt-2 shrink-0" />
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Products */}
              {activeAdvice.recommended_products.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <span>{t.advisor.recommendedProducts}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeAdvice.recommended_products.map((prod, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">{prod.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border text-slate-700">
                            {prod.category}
                          </span>
                        </div>
                        <p className="text-xs text-agri-800 font-semibold">खुराक: {prod.dosage}</p>
                        <p className="text-[11px] text-slate-500">{prod.purpose}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Nearby Stores */}
              {activeAdvice.nearby_stores.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Store className="w-5 h-5 text-blue-700" />
                    <span>{t.advisor.nearbyStores}</span>
                  </h3>
                  <div className="space-y-2">
                    {activeAdvice.nearby_stores.map((store, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-blue-100 bg-blue-50/40 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{store.name}</span>
                          <span className="text-blue-700 font-semibold">{store.distance_km} किमी दूर</span>
                          {store.matched_products.length > 0 && (
                            <span className="text-slate-600 block mt-0.5">
                              उपलब्ध: {store.matched_products.join(", ")}
                            </span>
                          )}
                        </div>
                        <Badge variant={store.in_stock ? "success" : "default"}>
                          {store.in_stock ? t.advisor.inStock : t.advisor.outOfStock}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {activeAdvice.warnings.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1 text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>{t.advisor.warnings}</span>
                  </div>
                  {activeAdvice.warnings.map((w, i) => (
                    <p key={i} className="leading-snug">{w}</p>
                  ))}
                </div>
              )}

              {/* Citations & Disclaimer */}
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                <p className="flex items-center gap-1 font-semibold text-slate-600">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t.advisor.sources}: {activeAdvice.sources.join(" | ")}</span>
                </p>
                <p className="italic text-slate-400">{activeAdvice.disclaimer}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
