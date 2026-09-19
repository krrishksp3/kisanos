"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sprout, UserCheck, AlertCircle } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      setErrorMsg(lang === "hi" ? "कृपया मोबाइल नंबर और पासवर्ड दर्ज करें।" : "Please enter mobile number and password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      await api.auth.login(phone, password);
      router.push("/dashboard");
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg(t.auth.invalidLogin);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setErrorMsg(null);
    try {
      await api.auth.login("9876543210", "Password123!");
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "डेमो लॉगिन विफल रहा। कृपया सुनिश्चित करें कि बैकएंड सर्वर चल रहा है।");
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-6 sm:py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-agri-700 text-white items-center justify-center shadow-md mb-2">
            <Sprout className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.appName}
          </h1>
          <p className="text-sm sm:text-base font-semibold text-agri-800">
            {t.appTagline}
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl sm:text-2xl">{t.auth.welcome}</CardTitle>
            <CardDescription>{t.auth.tagline}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="font-medium">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label={t.auth.phoneLabel}
                type="tel"
                id="phone"
                placeholder={t.auth.phonePlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />

              <Input
                label={t.auth.passwordLabel}
                type="password"
                id="password"
                placeholder={t.auth.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full font-bold shadow-md"
                isLoading={isLoading}
              >
                {t.auth.loginButton}
              </Button>
            </form>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                या (OR)
              </span>
            </div>

            {/* 1-Click Demo Login Button */}
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="w-full gap-2 font-bold shadow-md"
              onClick={handleDemoLogin}
              isLoading={isDemoLoading}
            >
              <UserCheck className="w-5 h-5" />
              <span>{t.auth.demoButton}</span>
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 font-medium">
                डेमो क्रेडेंशियल: फोन: <span className="font-bold text-slate-700">9876543210</span> | पासवर्ड: <span className="font-bold text-slate-700">Password123!</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
