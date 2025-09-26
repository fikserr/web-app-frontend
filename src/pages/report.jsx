import React, { useState } from "react";
import useBalance from "../hooks/useBalance";
import useAktSverka from "../hooks/useAktSverka";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const Report = () => {
  const { balance, loading, error } = useBalance(tgUser?.id);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [showAkt, setShowAkt] = useState(false);

  const { akt, loading: aktLoading, error: aktError } = useAktSverka(
    tgUser?.id,
    showAkt && dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : null,
    showAkt && dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : null
  );

  if (loading) return <div>Yuklanmoqda...</div>;
  if (error) return <div>Xatolik: {error.message}</div>;

  return (
    <div className="px-4 py-20">
      <h1 className="font-bold text-3xl mb-4">Hisobot</h1>

      {/* Balans */}
      <div className="text-slate-600 mb-4">
        {balance.split("\n").map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </div>

      {/* Date pickers */}
      <div className="flex gap-3 mb-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full">
              {dateRange.from ? format(dateRange.from, "dd.MM.yyyy") : "Boshlanish"}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={dateRange.from}
              onSelect={(date) => setDateRange((p) => ({ ...p, from: date }))}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full">
              {dateRange.to ? format(dateRange.to, "dd.MM.yyyy") : "Tugash"}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={dateRange.to}
              onSelect={(date) => setDateRange((p) => ({ ...p, to: date }))}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Show button */}
      <Button
        disabled={!dateRange.from || !dateRange.to}
        onClick={() => setShowAkt(true)}
      >
        Hisobotni ko‘rish
      </Button>

      {showAkt && akt?.data && (
        <div className="mt-6 space-y-6">
          {/* Boshlang‘ich qoldiq */}
          <div className="bg-white shadow rounded-lg p-4 border">
            <h2 className="font-semibold text-lg mb-2">
              Boshlang‘ich qoldiq ({format(dateRange.from, "dd.MM.yyyy")})
            </h2>
            <p>Menga qarzdor: <b>{akt.data.initial.ktSum} uzs / {akt.data.initial.ktVal} $</b></p>
            <p>Men qarzdor: <b>{akt.data.initial.dtSum} uzs / {akt.data.initial.dtVal} $</b></p>
          </div>

          {/* Harakatlar */}
          <div className="space-y-3">
            {akt.data.list.map((item, idx) => (
              <div key={idx} className="bg-slate-50 rounded p-3 shadow-sm">
                <p className="font-semibold">{item.document}</p>
                <p className="text-xs text-slate-500">{item.date.slice(0, 10)}</p>
                {item.comment && (
                  <p className="text-sm text-slate-600">{item.comment}</p>
                )}
                <div className="flex justify-between text-sm mt-2">
                  <span>Menga qarzdor: <b>{item.ktSum} uzs</b></span>
                  <span>Men qarzdor: <b>{item.dtSum} uzs</b></span>
                </div>
              </div>
            ))}
          </div>

          {/* Oxirgi qoldiq */}
          <div className="bg-white shadow rounded-lg p-4 border">
            <h2 className="font-semibold text-lg mb-2">
              Oxirgi qoldiq ({format(dateRange.to, "dd.MM.yyyy")})
            </h2>
            <p>Menga qarzdor: <b>{akt.data.last.ktSum} uzs / {akt.data.last.ktVal} $</b></p>
            <p>Men qarzdor: <b>{akt.data.last.dtSum} uzs / {akt.data.last.dtVal} $</b></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
