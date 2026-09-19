"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TrendingUp, MapPin, Building, Info, ShoppingBag, ArrowRight } from "lucide-react";
import { useMarkets } from "@/hooks/useQueries";
import { useLanguage } from "@/lib/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function MarketPage() {
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState<string | undefined>(undefined);

  const { data: markets = [], isLoading } = useMarkets(selectedCrop);

  const filterOptions = [
    { label: t.market.allCrops, value: undefined },
    { label: "Wheat (गेहूं)", value: "Wheat" },
    { label: "Soybean (सोयाबीन)", value: "Soybean" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-emerald-700" />
          <span>{t.market.title}</span>
        </h1>
        <p className="text-sm text-slate-600 font-medium mt-1">
          {t.market.subtitle}
        </p>
      </div>

      {/* Prototype Notice Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="font-semibold">{t.market.prototypeNotice}</span>
        </div>
        <Badge variant="warning" className="text-[10px]">प्रोटोटाइप डेटा</Badge>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filterOptions.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelectedCrop(opt.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              selectedCrop === opt.value
                ? "bg-agri-700 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Markets & Buyers List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          उपलब्ध मंडियां एवं खरीदार बोलियां ({markets.length})
        </h3>

        {markets.map((m) => (
          <Card key={m.id} className="border-slate-200 bg-white shadow-xs hover:border-emerald-300 transition-all">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-bold text-agri-800 bg-agri-50 px-2.5 py-0.5 rounded-md inline-block mb-1">
                    {m.crop}
                  </span>
                  <h4 className="text-lg font-black text-slate-900">{m.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{m.location}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-2xl font-black text-emerald-700 block">
                    {formatCurrency(m.price_per_quintal)}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    प्रति क्विंटल भाव
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Building className="w-4 h-4 text-slate-400" />
                  <span>{t.market.buyer}: <span className="text-slate-900 font-bold">{m.buyer_name || "पंजीकृत व्यापारी"}</span></span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-600">
                    मांग: {m.available_quantity} क्विंटल
                  </span>
                  <Link href="/harvest">
                    <Button variant="primary" size="sm" className="text-xs gap-1 font-bold">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>लॉट बेचें</span>
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
