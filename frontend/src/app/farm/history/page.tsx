"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  History,
  ArrowLeft,
  Plus,
  TrendingUp,
  Sparkles,
  AlertCircle,
  Database,
  DollarSign,
  BarChart3,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { useQueryClient } from "@tanstack/react-query";
import { useFarms, useFarmHistory } from "@/hooks/useQueries";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export default function FarmHistoryPage() {
  const { t, lang } = useLanguage();
  const queryClient = useQueryClient();
  const { data: farms, isLoading: farmsLoading } = useFarms();
  const farm = farms && farms.length > 0 ? farms[0] : null;

  const { data: histories = [], isLoading: historyLoading } = useFarmHistory(farm?.id);

  const [showAddForm, setShowAddForm] = useState(false);
  const [cropName, setCropName] = useState("");
  const [season, setSeason] = useState("");
  const [area, setArea] = useState("2.5");
  const [yieldQuintal, setYieldQuintal] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [inputsUsed, setInputsUsed] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<"yield" | "revenue">("yield");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farm || !cropName || !season || !yieldQuintal || !sellingPrice) {
      setErrorMsg("कृपया सभी आवश्यक फ़ील्ड (फसल, सीजन, पैदावार, बिक्री मूल्य) भरें।");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.farms.addHistory(farm.id, {
        crop_name: cropName,
        season,
        area: parseFloat(area) || 2.5,
        yield_quintal: parseFloat(yieldQuintal),
        selling_price: parseFloat(sellingPrice),
        inputs_used: inputsUsed || undefined,
        notes: notes || undefined,
      });

      // Invalidate React Query caches for immediate UI synchronization
      await queryClient.invalidateQueries({ queryKey: ["farmHistory", farm.id] });
      await queryClient.invalidateQueries({ queryKey: ["farmInsights", farm.id] });
      await queryClient.invalidateQueries({ queryKey: ["farms"] });
      await queryClient.invalidateQueries({ queryKey: ["farm", farm.id] });

      setSuccessMsg("नया सीजन सफलतापूर्वक फार्म मेमोरी में दर्ज किया गया!");
      setShowAddForm(false);
      setCropName("");
      setSeason("");
      setYieldQuintal("");
      setSellingPrice("");
      setInputsUsed("");
      setNotes("");

      // Clear success notification after 5s
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || "इतिहास दर्ज करने में त्रुटि हुई।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const chartData = [...histories]
    .map((h) => ({
      season: h.season,
      yield: h.yield_quintal,
      revenue: h.selling_price,
      crop: h.crop_name,
    }))
    .reverse();

  const getSeasonIcon = (s: string) => {
    if (s.toLowerCase().includes("rabi") || s.includes("रबी")) return "🌾";
    return "🌱";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/farm"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <History className="w-7 h-7 text-amber-700" />
                <span>खेत मेमोरी (Farm Memory)</span>
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                <Database className="w-2.5 h-2.5 text-emerald-700" />
                डेटाबेस रिकॉर्ड
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {farm ? `${farm.name} (${farm.area_acres} एकड़)` : "खेत"} — पिछले सीजनों का उत्पादन, बिक्री आय एवं खाद-दवाइयों का सुरक्षित रिकॉर्ड
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setShowAddForm(!showAddForm)}
          className="gap-1.5 font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>नया सीजन रिकॉर्ड करें</span>
        </Button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center gap-2.5 text-sm font-semibold shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* "नया सीजन रिकॉर्ड करें" Form */}
      {showAddForm && (
        <Card className="border-agri-300 bg-gradient-to-br from-agri-50/50 via-white to-emerald-50/30 shadow-md animate-in slide-in-from-top-2 duration-200">
          <CardHeader className="pb-3 border-b border-agri-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg font-black text-slate-900">
                  नया सीजन रिकॉर्ड करें (Log Harvest Season)
                </CardTitle>
                <p className="text-xs text-slate-500 font-medium">
                  यह डेटा सीधे आपके खेत की Farm Memory में सुरक्षित होगा और भावी एआई सलाह में प्रयुक्त होगा।
                </p>
              </div>
              <Badge variant="outline" className="text-xs text-agri-800">
                POST /api/farms/{farm?.id}/history
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  label="फसल का नाम एवं किस्म *"
                  placeholder="उदा. Wheat / Sharbati या Gram (चना)"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  required
                />

                <Input
                  label="सीजन एवं वर्ष *"
                  placeholder="उदा. Rabi 2023-24 या Kharif 2023"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  required
                />

                <Input
                  label="रकबा (एकड़) *"
                  type="number"
                  step="0.1"
                  placeholder="उदा. 2.5"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  required
                />

                <Input
                  label="कुल पैदावार (क्विंटल) *"
                  type="number"
                  step="0.5"
                  placeholder="उदा. 18.0"
                  value={yieldQuintal}
                  onChange={(e) => setYieldQuintal(e.target.value)}
                  required
                />

                <Input
                  label="कुल बिक्री आय (₹) *"
                  type="number"
                  placeholder="उदा. 41400"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  required
                />

                <Input
                  label="प्रयुक्त खाद व दवाएं (Inputs Used)"
                  placeholder="उदा. DAP 1 बोरी, यूरिया 45 किग्रा, टिल्ट"
                  value={inputsUsed}
                  onChange={(e) => setInputsUsed(e.target.value)}
                />
              </div>

              <Input
                label="किसान के अनुभव व टिप्पणी (Notes)"
                placeholder="उदा. मौसम सामान्य रहा, दाना चमकदार था, मंडी में अच्छा भाव मिला।"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  रद्द करें
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  className="font-bold"
                >
                  सुरक्षित करें (Save to Farm Memory)
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Yield & Revenue Analytics Charts (Recharts) */}
      {historyLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : chartData.length > 0 ? (
        <Card className="border-slate-200 bg-white shadow-sm p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-agri-700" />
                <span>तुलनात्मक विश्लेषण (Season Comparison Analytics)</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                विभिन्न सीजनों में दर्ज वास्तविक उत्पादन व वित्तीय प्राप्ति
              </p>
            </div>

            {/* Toggle Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setActiveChartTab("yield")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeChartTab === "yield"
                    ? "bg-white text-agri-800 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                उपज तुलना (क्विंटल)
              </button>
              <button
                type="button"
                onClick={() => setActiveChartTab("revenue")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeChartTab === "revenue"
                    ? "bg-white text-emerald-800 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                बिक्री आय तुलना (₹)
              </button>
            </div>
          </div>

          {/* Graceful Single-Record Notice */}
          {chartData.length === 1 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                वर्तमान में 1 सीजन का रिकॉर्ड उपलब्ध है। बहु-सीजन तुलना देखने के लिए &quot;नया सीजन रिकॉर्ड करें&quot; बटन से पुराना रिकॉर्ड दर्ज करें।
              </span>
            </div>
          )}

          {/* Chart Canvas */}
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {activeChartTab === "yield" ? (
                <BarChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="season" tick={{ fontSize: 12, fill: "#475569" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#475569" }} />
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val} क्विंटल (${item.payload.crop})`,
                      "कुल पैदावार",
                    ]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                  />
                  <Bar dataKey="yield" fill="#15803d" radius={[8, 8, 0, 0]} name="उपज (क्विंटल)" />
                </BarChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="season" tick={{ fontSize: 12, fill: "#475569" }} />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#475569" }}
                    tickFormatter={(val) => `₹${val / 1000}k`}
                  />
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${formatCurrency(val)} (${item.payload.crop})`,
                      "बिक्री आय",
                    ]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#0284c7" radius={[8, 8, 0, 0]} name="आय (₹)" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </Card>
      ) : null}

      {/* Season Timeline & Cards */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              सीजन इतिहास समय-सारणी (Season Timeline)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              खेत पर दर्ज किए गए प्रत्येक सीजन की संपूर्ण जानकारी
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            कुल रिकॉर्ड्स: {histories.length}
          </span>
        </div>

        {histories.length > 0 ? (
          <div className="space-y-3">
            {histories.map((item) => {
              const icon = getSeasonIcon(item.season);
              return (
                <Card
                  key={item.id}
                  className="border-slate-200 bg-white shadow-2xs hover:border-agri-300 hover:shadow-xs transition-all overflow-hidden"
                >
                  <CardContent className="p-4 sm:p-5 space-y-3">
                    {/* Top Row: Season Badge, Crop Name, Area, Revenue & Yield */}
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-amber-900 bg-amber-100/90 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                            <span className="text-sm">{icon}</span>
                            <span>{item.season}</span>
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {item.area} एकड़ रकबा
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.data_source === "farmer_logged" ? "किसान प्रविष्टि" : "डेटाबेस रिकॉर्ड"}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 mt-1">
                          {item.crop_name}
                        </h4>
                      </div>

                      <div className="text-right sm:text-right">
                        <span className="text-lg sm:text-xl font-black text-emerald-700 block">
                          {formatCurrency(item.selling_price)}
                        </span>
                        <span className="text-xs font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
                          पैदावार: {item.yield_quintal} क्विंटल
                        </span>
                      </div>
                    </div>

                    {/* Inputs Used */}
                    {item.inputs_used && (
                      <div className="text-xs text-slate-700 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100 flex items-start gap-2">
                        <span className="font-extrabold text-amber-950 shrink-0">
                          प्रयुक्त खाद व दवाएं:
                        </span>
                        <span className="font-medium text-slate-800">{item.inputs_used}</span>
                      </div>
                    )}

                    {/* Notes */}
                    {item.notes && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                        &ldquo;{item.notes}&rdquo;
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center bg-white border border-slate-200">
            <p className="text-slate-600 font-medium">कोई फसल इतिहास दर्ज नहीं है।</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="mt-3"
            >
              पहला सीजन दर्ज करें
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
