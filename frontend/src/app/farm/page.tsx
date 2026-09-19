"use client";

import React from "react";
import Link from "next/link";
import {
  Sprout,
  History,
  Camera,
  MessageSquare,
  MapPin,
  Droplets,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Calendar,
  Layers,
  Database,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { useFarms, useFarmInsights, useObservations } from "@/hooks/useQueries";
import { useLanguage } from "@/lib/LanguageContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export default function FarmPage() {
  const { t, lang } = useLanguage();
  const { data: farms, isLoading: farmsLoading } = useFarms();

  const farm = farms && farms.length > 0 ? farms[0] : null;
  const { data: insights, isLoading: insightsLoading } = useFarmInsights(farm?.id);
  const { data: observations, isLoading: obsLoading } = useObservations(farm?.id);

  if (farmsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header with Quick Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sprout className="w-7 h-7 text-agri-700" />
              <span>{t.nav.farm} प्रोफाइल</span>
            </h1>
            <Badge variant="outline" className="text-xs font-bold text-slate-600">
              डेटाबेस प्रमाणित
            </Badge>
          </div>
          <p className="text-sm text-slate-600 font-medium mt-1">
            खेत की भौगोलिक स्थिति, मिट्टी गुण, सिंचाई, फसल चक्र एवं फार्म मेमोरी का संपूर्ण विवरण
          </p>
        </div>

        {/* Clear Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/farm/history">
            <Button variant="outline" size="sm" className="gap-1.5 font-bold text-xs bg-amber-50/60 border-amber-300 text-amber-900 hover:bg-amber-100">
              <History className="w-4 h-4 text-amber-700" />
              <span>[Farm History]</span>
            </Button>
          </Link>
          <Link href="/monitor">
            <Button variant="outline" size="sm" className="gap-1.5 font-bold text-xs bg-emerald-50/60 border-emerald-300 text-emerald-900 hover:bg-emerald-100">
              <Camera className="w-4 h-4 text-emerald-700" />
              <span>[Crop Monitor]</span>
            </Button>
          </Link>
          <Link href="/advisor">
            <Button variant="primary" size="sm" className="gap-1.5 font-bold text-xs shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>[AI Advisor]</span>
            </Button>
          </Link>
        </div>
      </div>

      {farm ? (
        <div className="space-y-6">
          {/* 1. Farm Overview Section */}
          <Card className="border-agri-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-agri-900 via-agri-800 to-agri-700 text-white p-5 sm:p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-agri-200 text-xs font-bold uppercase tracking-wider">
                    प्राथमिक खेत (Farm Overview)
                  </span>
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">
                    सक्रिय रिकॉर्ड
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black">{farm.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-agri-100 mt-2 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-agri-300" />
                    {farm.location}
                  </span>
                  {farm.latitude && farm.longitude && (
                    <span className="opacity-80">
                      GPS: {farm.latitude}° N, {farm.longitude}° E
                    </span>
                  )}
                  <span>•</span>
                  <span>पंजीकरण: {new Date(farm.created_at).toLocaleDateString("hi-IN")}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-4 py-2 rounded-2xl text-center">
                  <span className="text-[11px] text-agri-200 block font-semibold">कुल रकबा</span>
                  <span className="text-xl font-black text-white">{farm.area_acres} एकड़</span>
                </div>
              </div>
            </div>

            {/* Farm Highlights Banner */}
            <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-500 font-semibold block">खेत आईडी:</span>
                <span className="font-mono text-slate-700 font-medium text-[11px] truncate block">{farm.id}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-500 font-semibold block">क्षेत्रीय जलवायु:</span>
                <span className="font-bold text-slate-800 block">मालवा पठार (मध्य भारत)</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-500 font-semibold block">जल स्रोत:</span>
                <span className="font-bold text-slate-800 block">नलकूप (सक्रिय)</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-500 font-semibold block">डेटा स्थिति:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Farm Memory सक्रिय
                </span>
              </div>
            </div>
          </Card>

          {/* 2 & 3 & 4. Current Crop, Soil, and Irrigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 2. Current Crop Card */}
            <Card className="border-slate-200 bg-white shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">वर्तमान फसल (Current Crop)</h3>
                    <p className="text-[11px] text-slate-500 font-medium">रबी 2024-25 चक्र</p>
                  </div>
                </div>
                <Badge variant="success" className="text-xs">
                  सक्रिय
                </Badge>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">किस्म एवं नाम:</span>
                  <span className="text-base font-black text-slate-900">{farm.current_crop || "Wheat (Sharbati)"}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">विकास अवस्था (Stage):</span>
                  <span className="text-sm font-bold text-agri-800 bg-agri-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                    {farm.current_stage || "कल्ले फूटने की अवस्था (Tillering)"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
                  वर्तमान में कल्ले फूटने का चरण चल रहा है। इस समय यूरिया व सिंचाई का उचित संतुलन आवश्यक है।
                </p>
              </div>
            </Card>

            {/* 3. Soil Card */}
            <Card className="border-slate-200 bg-white shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">मिट्टी गुण (Soil Profile)</h3>
                    <p className="text-[11px] text-slate-500 font-medium">मृदा स्वास्थ्य कार्ड अनुसार</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-bold text-amber-800 border-amber-300">
                  pH {farm.soil_ph || "6.8"}
                </Badge>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">मिट्टी वर्गीकरण:</span>
                  <span className="text-base font-black text-slate-900">{farm.soil_type}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-500 font-semibold block">जल धारण क्षमता</span>
                    <span className="font-bold text-slate-900">उच्च (65%)</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-500 font-semibold block">जैविक कार्बन</span>
                    <span className="font-bold text-slate-900">मध्यम (0.62%)</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
                  काली दोमट मिट्टी में जल धारण क्षमता उत्कृष्ट है। गेहूं व सोयाबीन दोनों के लिए अनुकूल है।
                </p>
              </div>
            </Card>

            {/* 4. Irrigation Card */}
            <Card className="border-slate-200 bg-white shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">सिंचाई व्यवस्था (Irrigation)</h3>
                    <p className="text-[11px] text-slate-500 font-medium">जल प्रबंधन प्रणाली</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-bold text-blue-800 border-blue-300">
                  क्रियाशील
                </Badge>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">सिंचाई विधि:</span>
                  <span className="text-base font-black text-slate-900">{farm.irrigation_type}</span>
                </div>
                <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-100 text-xs text-blue-900 font-medium">
                  नलकूप से जल आपूर्ति सुचारु है। ड्रिप लाइन द्वारा जल की 35-40% तक बचत होती है।
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
                  मौसम पूर्वानुमान अनुसार आगामी 48 घंटों में वर्षा की संभावना होने पर सिंचाई 2 दिन टालें।
                </p>
              </div>
            </Card>
          </div>

          {/* 5. Farm History (खेत मेमोरी) Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-700" />
                  <span>खेत मेमोरी एवं पूर्व सीजन इतिहास (Farm History)</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  पिछले सीजनों में हुई वास्तविक पैदावार एवं खाद उपयोग के सुरक्षित आंकड़े
                </p>
              </div>
              <Link href="/farm/history">
                <Button variant="outline" size="sm" className="gap-1 font-bold text-xs">
                  <span>पूर्ण इतिहास व चार्ट देखें</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {farm.histories && farm.histories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {farm.histories.slice(0, 2).map((h) => (
                  <Card key={h.id} className="border-amber-200/70 bg-gradient-to-br from-amber-50/30 to-white shadow-2xs">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                          {h.season.toLowerCase().includes("rabi") ? "🌾" : "🌱"} {h.season}
                        </span>
                        <span className="text-slate-500 font-semibold">{h.area} एकड़ रकबा</span>
                      </div>
                      <div className="font-black text-base text-slate-900">{h.crop_name}</div>
                      <div className="flex items-baseline justify-between text-xs pt-1 border-t border-slate-100">
                        <span className="text-slate-600 font-medium">कुल पैदावार:</span>
                        <span className="font-black text-slate-900">{h.yield_quintal} क्विंटल</span>
                      </div>
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-slate-600 font-medium">बिक्री आय:</span>
                        <span className="font-black text-emerald-700">{formatCurrency(h.selling_price)}</span>
                      </div>
                      {h.inputs_used && (
                        <div className="text-[11px] text-slate-600 bg-white p-2 rounded-md border border-amber-100">
                          <span className="font-bold text-slate-700">खाद प्रयोग: </span>
                          {h.inputs_used}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-4 text-center text-xs text-slate-500 bg-white border border-slate-200">
                कोई पूर्व इतिहास दर्ज नहीं है।
              </Card>
            )}
          </div>

          {/* 6. Recent Observations (हालिया फसल निरीक्षण) Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-700" />
                  <span>हालिया फसल निरीक्षण (Recent Crop Observations)</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  खेत में दर्ज किए गए लक्षण, रोग संकेत एवं एआई परीक्षण
                </p>
              </div>
              <Link href="/monitor">
                <Button variant="outline" size="sm" className="gap-1 font-bold text-xs text-emerald-800 border-emerald-300 hover:bg-emerald-50">
                  <Camera className="w-3.5 h-3.5" />
                  <span>नया लक्षण जांचें</span>
                </Button>
              </Link>
            </div>

            {observations && observations.length > 0 ? (
              <div className="space-y-2.5">
                {observations.slice(0, 2).map((obs) => (
                  <Card key={obs.id} className="border-slate-200 bg-white shadow-2xs hover:border-slate-300">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{obs.crop}</span>
                          <Badge
                            variant={
                              obs.severity === "high" || obs.severity === "critical"
                                ? "danger"
                                : obs.severity === "medium"
                                ? "warning"
                                : "success"
                            }
                            className="text-[10px]"
                          >
                            {obs.severity === "medium" ? "मध्यम गंभीरता" : obs.severity}
                          </Badge>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {new Date(obs.created_at).toLocaleDateString("hi-IN")}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-semibold">
                          लक्षण: {obs.symptoms}
                        </p>
                        {obs.ai_diagnosis && (
                          <p className="text-xs text-purple-900 font-medium bg-purple-50 p-1.5 rounded border border-purple-100 inline-block">
                            एआई निदान: {obs.ai_diagnosis}
                          </p>
                        )}
                        {obs.recommendation && (
                          <p className="text-xs text-slate-600">
                            सुझाव: {obs.recommendation}
                          </p>
                        )}
                      </div>

                      <Link href="/advisor">
                        <Button variant="ghost" size="sm" className="text-xs font-bold text-agri-800 hover:bg-agri-50">
                          <span>परामर्श लें</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-4 text-center text-xs text-slate-500 bg-white border border-slate-200">
                हालिया निरीक्षण उपलब्ध नहीं है।
              </Card>
            )}
          </div>

          {/* 7. Farm Insights (व्यक्तिगत खेत अंतर्दृष्टि) Section */}
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-700" />
                <span>व्यक्तिगत खेत अंतर्दृष्टि (Personalized Farm Insights)</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                खेत के वास्तविक इतिहास, मिट्टी व वर्तमान मौसम पर आधारित तथ्य
              </p>
            </div>

            {insightsLoading ? (
              <Skeleton className="h-36 w-full rounded-2xl" />
            ) : insights ? (
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50/40 via-white to-indigo-50/20 shadow-sm p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {insights.farm_summary}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      {insights.current_crop_context}
                    </p>
                  </div>
                </div>

                {insights.insights && insights.insights.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-purple-100">
                    {insights.insights.map((ins, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{ins}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ) : null}
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center bg-white">
          <p className="text-slate-600">कोई खेत पंजीकृत नहीं है।</p>
        </Card>
      )}
    </div>
  );
}
