"use client";

import React, { useEffect, useState } from "react";
import { Settings as SettingsIcon, Globe, Database, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { t, lang, setLang } = useLanguage();
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isPinging, setIsPinging] = useState(false);

  const checkHealth = async () => {
    setIsPinging(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealthStatus(data);
    } catch {
      setHealthStatus({ status: "disconnected" });
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-slate-700" />
          <span>{t.nav.settings}</span>
        </h1>
        <p className="text-sm text-slate-600 font-medium mt-1">
          एप्लिकेशन प्राथमिकताएं एवं सिस्टम स्थिति
        </p>
      </div>

      <div className="space-y-4">
        {/* Language Selection Card */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-agri-700" />
              <CardTitle className="text-base font-bold text-slate-900">भाषा चयन (Select Language)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <button
                onClick={() => setLang("hi")}
                className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all text-center ${
                  lang === "hi"
                    ? "bg-agri-700 text-white border-agri-700 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                हिन्दी (Hindi - First)
              </button>
              <button
                onClick={() => setLang("en")}
                className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all text-center ${
                  lang === "en"
                    ? "bg-agri-700 text-white border-agri-700 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                English
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Backend & DB Connectivity Card */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-700" />
                <CardTitle className="text-base font-bold text-slate-900">बैकएंड सिस्टम स्वास्थ्य</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={checkHealth} isLoading={isPinging} className="text-xs">
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                <span>पुनः जांचें</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-2">
            {healthStatus?.status === "healthy" ? (
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>फास्टएपीआई सर्वर एवं डेटाबेस सामान्य रूप से क्रियाशील हैं। (डायलैक्ट: {healthStatus?.database?.dialect})</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-900 text-xs font-bold bg-amber-50 p-3 rounded-xl border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>बैकएंड सर्वर से कनेक्शन जांचा जा रहा है...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
