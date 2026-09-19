"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { User, Phone, MapPin, Globe, Sprout, LogOut, Shield } from "lucide-react";
import { useCurrentUser, useFarms } from "@/hooks/useQueries";
import { useLanguage } from "@/lib/LanguageContext";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const router = useRouter();
  const { t, lang, toggleLang } = useLanguage();
  const { data: user } = useCurrentUser();
  const { data: farms = [] } = useFarms();

  const handleLogout = () => {
    api.auth.logout();
    router.push("/login");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-7 h-7 text-agri-700" />
          <span>{t.nav.profile}</span>
        </h1>
        <p className="text-sm text-slate-600 font-medium mt-1">
          किसान साथी का व्यक्तिगत एवं कृषि प्रोफाइल
        </p>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-agri-800 to-agri-700 text-white p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center font-extrabold text-2xl border-2 border-white/40">
            {user?.name ? user.name.slice(0, 1) : "K"}
          </div>
          <div>
            <h2 className="text-xl font-black">{user?.name || "रामेश पटेल"}</h2>
            <p className="text-xs text-agri-200 mt-0.5 flex items-center gap-1 font-medium">
              <Shield className="w-3.5 h-3.5 text-agri-300" />
              <span>प्रमाणित किसान (Verified Farmer)</span>
            </p>
          </div>
        </div>

        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <Phone className="w-5 h-5 text-agri-700 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-slate-500 block">मोबाइल नंबर</span>
                <span className="font-extrabold text-slate-900">{user?.phone || "9876543210"}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-agri-700 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-slate-500 block">पता / जिला</span>
                <span className="font-extrabold text-slate-900">{user?.location || "सीहोर, मध्य प्रदेश"}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700">वर्तमान भाषा: {lang === "hi" ? "हिन्दी" : "English"}</span>
            </div>
            <button
              onClick={toggleLang}
              className="text-xs font-bold text-agri-700 hover:underline"
            >
              भाषा बदलें
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Button
              variant="danger"
              size="md"
              onClick={handleLogout}
              className="w-full gap-2 font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.auth.logout}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
