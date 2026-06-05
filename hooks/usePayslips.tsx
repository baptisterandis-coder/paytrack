"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Payslip } from "@/utils/salary";

function usePayslipsState() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Non authentifié"); return; }
      const { data, error: e } = await supabase
        .from("payslips").select("*").eq("user_id", user.id)
        .order("period_year", { ascending: false })
        .order("period_month", { ascending: false });
      if (e) throw e;
      setPayslips(data ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  const extractPayslipData = async (filePath: string, fileType: string, previousPayslip?: Payslip | null) => {
    try {
      const { data } = await supabase.storage.from("payslips").download(filePath);
      if (!data) return null;
      if (!fileType.includes("pdf")) return null;
      const buffer = await data.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      const { data: fnData, error: fnError } = await supabase.functions.invoke("extract-payslip", {
        body: {
          pdfBase64: base64,
          previousPayslip: previousPayslip ? {
            period_month: previousPayslip.period_month,
            period_year: previousPayslip.period_year,
            gross_salary: previousPayslip.gross_salary,
            net_salary: previousPayslip.net_salary,
            charges: previousPayslip.charges,
            ai_comment: previousPayslip.ai_comment,
          } : null,
        },
      });
      if (fnError) throw fnError;
      if (fnData?.success) return { data: fnData.data, ai_comment: fnData.ai_comment };
      return null;
    } catch (e) {
      console.error("Extraction error:", e);
      return null;
    }
  };

  const getPreviousPayslip = (payslips: Payslip[], month: number, year: number): Payslip | null => {
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth === 0) { prevMonth = 12; prevYear--; }
    return payslips.find(p => p.period_month === prevMonth && p.period_year === prevYear) ?? null;
  };

  const uploadPayslip = async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: up } = await supabase.storage.from("payslips").upload(path, file);
    if (up) throw up;
    const now = new Date();
    const { data: inserted, error: ins } = await supabase.from("payslips").insert({
      user_id: user.id, file_name: file.name, file_path: path, file_size: file.size,
      period_month: now.getMonth() + 1, period_year: now.getFullYear(),
      processed: false, processing_status: "pending",
    }).select().single();
    if (ins) throw ins;
    await fetch();

    if (file.type === "application/pdf" && inserted) {
      const { data: allPayslips } = await supabase
        .from("payslips").select("*").eq("user_id", user.id);
      const previousPayslip = getPreviousPayslip(
        allPayslips ?? [],
        now.getMonth() + 1,
        now.getFullYear()
      );
      const result = await extractPayslipData(path, file.type, previousPayslip);
      if (result) {
        const { data: extracted, ai_comment } = result;
        await supabase.from("payslips").update({
          period_month: extracted.period_month ?? now.getMonth() + 1,
          period_year: extracted.period_year ?? now.getFullYear(),
          company_name: extracted.company_name ?? null,
          gross_salary: extracted.gross_salary ?? null,
          net_salary: extracted.net_salary ?? null,
          net_after_tax: extracted.net_salary ?? null,
          charges: extracted.charges ?? null,
          ai_comment: ai_comment ?? null,
          processed: true,
          processing_status: "completed",
        }).eq("id", inserted.id);
        await fetch();
      }
    }
  };

  const importFromExcel = async ({ month, year, company, gross, net, tax }: {
    month: number;
    year: number;
    company: string | null;
    gross: number;
    net: number;
    tax: number | null;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");

    const fileName = `import-${year}-${String(month).padStart(2, "0")}${company ? `-${company.replace(/\s+/g, "-").toLowerCase()}` : ""}.xlsx`;

    await supabase.from("payslips").insert({
      user_id: user.id,
      file_name: fileName,
      file_path: `${user.id}/imports/${fileName}`,
      file_size: 0,
      period_month: month,
      period_year: year,
      company_name: company,
      gross_salary: gross,
      net_salary: net,
      net_after_tax: net,
      charges: tax,
      processed: true,
      processing_status: "completed",
    });

    await fetch();
  };

  const deletePayslip = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: p } = await supabase.from("payslips").select("file_path").eq("id", id).eq("user_id", user.id).single();
    if (p) await supabase.storage.from("payslips").remove([p.file_path]);
    await supabase.from("payslips").delete().eq("id", id).eq("user_id", user.id);
    await fetch();
  };

  const downloadPayslip = async (p: Payslip) => {
    const { data } = await supabase.storage.from("payslips").download(p.file_path);
    if (!data) return;
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url; a.download = p.file_name;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const updatePayslip = async (id: string, updates: Partial<Payslip>) => {
    await supabase.from("payslips").update({
      ...updates,
      net_after_tax: updates.net_salary,
      processed: true,
      processing_status: "completed"
    }).eq("id", id);
    await fetch();
  };

  // Chargement initial + abonnement temps réel : tout changement sur les
  // bulletins de l'utilisateur (ajout, édition, suppression, extraction IA,
  // autre onglet/appareil) rafraîchit automatiquement l'état partagé.
  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      await fetch();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !active) return;
      channel = supabase
        .channel("payslips-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "payslips", filter: `user_id=eq.${user.id}` },
          () => { fetch(); }
        )
        .subscribe();
    })();
    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetch]);

  return { payslips, loading, error, refetch: fetch, uploadPayslip, deletePayslip, downloadPayslip, updatePayslip, importFromExcel };
}

type PayslipsContextValue = ReturnType<typeof usePayslipsState>;
const PayslipsContext = createContext<PayslipsContextValue | null>(null);

export function PayslipsProvider({ children }: { children: ReactNode }) {
  const value = usePayslipsState();
  return <PayslipsContext.Provider value={value}>{children}</PayslipsContext.Provider>;
}

export function usePayslips() {
  const ctx = useContext(PayslipsContext);
  if (!ctx) throw new Error("usePayslips doit être utilisé à l'intérieur d'un <PayslipsProvider>");
  return ctx;
}
