"use client";

import React, { useState } from "react";
import { Camera, Upload, AlertCircle, CheckCircle, ShieldAlert, Sparkles, Image as ImageIcon } from "lucide-react";
import { useFarms, useObservations } from "@/hooks/useQueries";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function MonitorPage() {
  const { t } = useLanguage();
  const { data: farms } = useFarms();
  const farm = farms && farms.length > 0 ? farms[0] : null;

  const { data: observations = [], refetch } = useObservations(farm?.id);

  const [crop, setCrop] = useState(farm?.current_crop || "Wheat (गेहूं)");
  const [symptoms, setSymptoms] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farm || !symptoms.trim()) return;

    setIsSubmitting(true);
    try {
      await api.observations.create({
        farm_id: farm.id,
        crop: crop || farm.current_crop || "Wheat",
        symptoms,
        severity,
        recommendation: "निगरानी दर्ज की गई। मौसम साफ होने पर जांच करें।",
        image_url: imagePreview ? "local_upload_preview.jpg" : undefined,
      });
      setSymptoms("");
      setImagePreview(null);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
      refetch();
    } catch (err) {
      console.error("Failed to save observation:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Camera className="w-7 h-7 text-emerald-700" />
          <span>{t.monitor.title}</span>
        </h1>
        <p className="text-sm text-slate-600 font-medium mt-1">
          {t.monitor.subtitle}
        </p>
      </div>

      {/* Phase 7 Vision Architecture Notice */}
      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2.5">
        <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
        <p className="font-semibold leading-snug">
          {t.monitor.phase7Notice}
        </p>
      </div>

      {/* Photo Upload & Symptom Form */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">
            {t.monitor.uploadTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>स्वास्थ्य अवलोकन सफलतापूर्वक दर्ज कर लिया गया!</span>
            </div>
          )}

          <form onSubmit={handleRecord} className="space-y-4">
            {/* Image Dropzone / Camera */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-agri-500 transition-colors bg-slate-50/50">
              {imagePreview ? (
                <div className="space-y-3">
                  <div className="max-h-48 max-w-xs mx-auto overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Crop preview" className="w-full h-full object-cover" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setImagePreview(null)}
                    className="text-xs"
                  >
                    हटाएं व दूसरी फोटो चुनें
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-2">
                  <div className="w-12 h-12 rounded-full bg-agri-100 text-agri-800 mx-auto flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-800 block">फोटो खींचें या अपलोड करें</span>
                    <span className="text-xs text-slate-500 font-medium">{t.monitor.uploadDesc}</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label={t.monitor.selectCrop}
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                  लक्षण गंभीरता (Severity)
                </label>
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {(["low", "medium", "high", "critical"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSeverity(lvl)}
                      className={`py-2 px-1 text-xs font-bold rounded-lg border text-center transition-all ${
                        severity === lvl
                          ? lvl === "critical"
                            ? "bg-red-600 text-white border-red-600"
                            : lvl === "high"
                            ? "bg-amber-600 text-white border-amber-600"
                            : lvl === "medium"
                            ? "bg-amber-100 text-amber-900 border-amber-300 font-black"
                            : "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {lvl === "low" ? "सामान्य" : lvl === "medium" ? "मध्यम" : lvl === "high" ? "गंभीर" : "अति गंभीर"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                {t.monitor.enterSymptoms}
              </label>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-agri-600"
                placeholder={t.monitor.symptomsPlaceholder}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                {t.monitor.recordButton}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recent Observations List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {t.monitor.recentObservations}
        </h3>
        {observations.length > 0 ? (
          observations.map((obs) => (
            <Card key={obs.id} className="border-slate-200 bg-white shadow-xs">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="font-extrabold text-base text-slate-900 block">{obs.crop}</span>
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(obs.created_at).toLocaleDateString()} • {new Date(obs.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <Badge
                    variant={
                      obs.severity === "critical" || obs.severity === "high"
                        ? "danger"
                        : obs.severity === "medium"
                        ? "warning"
                        : "success"
                    }
                  >
                    गंभीरता: {obs.severity}
                  </Badge>
                </div>

                <div className="mt-3 text-xs sm:text-sm text-slate-700 space-y-1 font-medium">
                  <p><span className="font-bold text-slate-900">लक्षण: </span>{obs.symptoms}</p>
                  {obs.ai_diagnosis && (
                    <p className="text-agri-800"><span className="font-bold">संभावित निदान: </span>{obs.ai_diagnosis}</p>
                  )}
                  {obs.recommendation && (
                    <p className="text-slate-600"><span className="font-bold">अनुशंसा: </span>{obs.recommendation}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
            {t.monitor.noObservations}
          </div>
        )}
      </div>
    </div>
  );
}
