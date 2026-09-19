"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Store as StoreIcon, ArrowLeft, Phone, MapPin, CheckCircle, XCircle, Info } from "lucide-react";
import { useStore, useStoreInventory } from "@/hooks/useQueries";
import { useLanguage } from "@/lib/LanguageContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function StoreDetailPage() {
  const params = useParams();
  const storeId = params.id as string;
  const { t } = useLanguage();

  const { data: store, isLoading: storeLoading } = useStore(storeId);
  const { data: inventory = [], isLoading: invLoading } = useStoreInventory(storeId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link href="/stores" className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <StoreIcon className="w-6 h-6 text-blue-700" />
            <span>{store?.name || "दुकान विवरण"}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">{store?.address}</p>
        </div>
      </div>

      {store && (
        <Card className="border-slate-200 bg-white shadow-xs p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">संपर्क सूत्र:</span>
              <span className="text-base font-bold text-slate-900">{store.phone || "उपलब्ध नहीं"}</span>
            </div>
            {store.phone && (
              <a href={`tel:${store.phone}`}>
                <Button variant="primary" size="sm" className="gap-1.5 font-bold text-xs">
                  <Phone className="w-4 h-4" />
                  <span>दुकानदार से बात करें</span>
                </Button>
              </a>
            )}
          </div>
        </Card>
      )}

      {/* Inventory Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            उपलब्ध खाद, बीज एवं कीटनाशक स्टॉक ({inventory.length})
          </h3>
          <Badge variant="outline" className="text-[10px]">सीडेड इनपुट डेटा</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {inventory.map((item) => (
            <Card key={item.id} className="border-slate-200 bg-white shadow-2xs">
              <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{item.product_name}</h4>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.category}</span>
                  </div>
                  <Badge variant={item.available ? "success" : "default"} className="text-[10px] shrink-0">
                    {item.available ? "उपलब्ध" : "स्टॉक समाप्त"}
                  </Badge>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">स्टॉक: {item.quantity} {item.unit}</span>
                  <span className="text-base font-black text-emerald-700">
                    {formatCurrency(item.price)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
