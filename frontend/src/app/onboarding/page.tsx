"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sprout, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [farmName, setFarmName] = useState("North Field A (उत्तर खेत A)");
  const [location, setLocation] = useState("सीहोर, मध्य प्रदेश");
  const [areaAcres, setAreaAcres] = useState("2.5");
  const [soilType, setSoilType] = useState("Black loamy soil (काली दोमट मिट्टी)");
  const [soilPh, setSoilPh] = useState("6.8");
  const [irrigationType, setIrrigationType] = useState("Tubewell + Drip (नलकूप + ड्रिप)");
  const [crop, setCrop] = useState("Wheat (गेहूं - Sharbati)");
  const [stage, setStage] = useState("Tillering (कल्ले फूटने की अवस्था)");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.farms.create({
        name: farmName,
        location,
        latitude: 23.2033,
        longitude: 77.0844,
        area_acres: parseFloat(areaAcres) || 2.5,
        soil_type: soilType,
        soil_ph: parseFloat(soilPh) || 6.8,
        irrigation_type: irrigationType,
        current_crop: crop,
        current_stage: stage,
      });
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to onboard farm:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-agri-700 text-white items-center justify-center shadow-sm">
          <Sprout className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          खेत विवरण दर्ज करें
        </h1>
        <p className="text-sm text-slate-600 font-medium">
          अपनी फसल और खेत की प्राथमिक जानकारी भरें ताकि AI सही परामर्श दे सके
        </p>
      </div>

      <Card className="border-slate-200 bg-white shadow-md">
        <CardContent className="p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="खेत का नाम"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="स्थान / जिला"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <Input
                label="रकबा (एकड़)"
                type="number"
                step="0.1"
                value={areaAcres}
                onChange={(e) => setAreaAcres(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="मिट्टी का प्रकार"
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
              />
              <Input
                label="मिट्टी का pH"
                type="number"
                step="0.1"
                value={soilPh}
                onChange={(e) => setSoilPh(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="वर्तमान फसल"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
              />
              <Input
                label="विकास अवस्था"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
              />
            </div>
            <Input
              label="सिंचाई व्यवस्था"
              value={irrigationType}
              onChange={(e) => setIrrigationType(e.target.value)}
            />

            <div className="pt-2">
              <Button type="submit" variant="primary" size="md" className="w-full font-bold" isLoading={isLoading}>
                खेत सहेजें और डैशबोर्ड पर जाएं
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
