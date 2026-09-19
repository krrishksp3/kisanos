"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Plus, CheckCircle, TrendingUp, ChevronRight, PackageCheck } from "lucide-react";
import { useFarms, useHarvestLots } from "@/hooks/useQueries";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function HarvestPage() {
  const { t } = useLanguage();
  const { data: farms } = useFarms();
  const farm = farms && farms.length > 0 ? farms[0] : null;

  const { data: lots = [], refetch } = useHarvestLots();

  const [showForm, setShowForm] = useState(false);
  const [crop, setCrop] = useState(farm?.current_crop || "Wheat (Sharbati Gold)");
  const [quantity, setQuantity] = useState("20.0");
  const [quality, setQuality] = useState("Grade A (Sharbati Gold - 11.2% Moisture)");
  const [moisture, setMoisture] = useState("11.2");
  const [location, setLocation] = useState("सीहोर मंडी यार्ड");
  const [expectedPrice, setExpectedPrice] = useState("2750");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farm || !crop || !quantity) return;

    setIsSubmitting(true);
    try {
      await api.harvest.create({
        farm_id: farm.id,
        crop,
        quantity: parseFloat(quantity),
        quality,
        location,
        status: "ready_for_sale",
        moisture_percentage: parseFloat(moisture) || undefined,
        expected_price_per_quintal: parseFloat(expectedPrice) || undefined,
      });
      setShowForm(false);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
      refetch();
    } catch (err) {
      console.error("Failed to create harvest lot:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-amber-700" />
            <span>{t.harvest.title}</span>
          </h1>
          <p className="text-sm text-slate-600 font-medium mt-1">
            {t.harvest.subtitle}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="gap-1 font-bold text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{t.harvest.submitLot}</span>
        </Button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>हार्वेस्ट लॉट सफलतापूर्वक दर्ज हो गया! अब आप सीधे मंडी या खरीदारों के भाव देख सकते हैं।</span>
        </div>
      )}

      {/* Lot Creation Form */}
      {showForm && (
        <Card className="border-amber-300 bg-amber-50/40 shadow-sm animate-in fade-in duration-200">
          <CardHeader className="pb-3 border-b border-amber-100">
            <CardTitle className="text-base font-bold text-slate-900">नया डिजिटल हार्वेस्ट लॉट विवरण</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label={t.harvest.cropName}
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                />
                <Input
                  label={t.harvest.quantity}
                  type="number"
                  step="0.5"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <Input
                  label={t.harvest.quality}
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                />
                <Input
                  label={t.harvest.moisture}
                  type="number"
                  step="0.1"
                  value={moisture}
                  onChange={(e) => setMoisture(e.target.value)}
                />
                <Input
                  label={t.harvest.location}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <Input
                  label="अपेक्षित भाव (₹ प्रति क्विंटल)"
                  type="number"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  रद्द करें
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                  लॉट तैयार करें
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Active Lots List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {t.harvest.activeLots} ({lots.length})
        </h3>

        {lots.map((lot) => (
          <Card key={lot.id} className="border-slate-200 bg-white shadow-xs hover:border-amber-300">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-black text-slate-900">{lot.crop}</h4>
                    <Badge variant="success" className="text-[10px]">
                      {lot.status === "ready_for_sale" ? t.harvest.readyForSale : lot.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{lot.quality}</p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xl font-black text-slate-900 block">{lot.quantity} क्विंटल</span>
                  {lot.expected_price_per_quintal && (
                    <span className="text-xs font-bold text-emerald-700">
                      भाव: {formatCurrency(lot.expected_price_per_quintal)} / Q
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-600 font-medium">स्थान: {lot.location}</span>
                <div className="flex items-center gap-2">
                  <Link href="/market">
                    <Button variant="secondary" size="sm" className="gap-1 font-bold text-xs">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{t.harvest.findBuyers}</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
