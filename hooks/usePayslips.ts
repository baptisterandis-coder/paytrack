"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Payslip } from "@/utils/salary";

export function usePayslips() {
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

  const extractPayslipData = async (filePath: string, fileType: string) => {
    try {
      const { data } = await supabase.storage.from("payslips").download(filePath);
      if (!data) return null;
      if (!fileType.includes("pdf")) return null;
      const buffer = await data.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      const { data: fnData, error: fnError } = await supabase.functions.invoke("extract-payslip", {
        body: { pdfBase64: base64 },
      });
      if (fnError) throw fnError;
      if (fnData?.success) return fnData.data;
      return null;
    } catch (e) {
      console.error("Extraction error:", e);
      return null;
    }
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

    // Extraction automatique si PDF
    if (file.type === "application/pdf" && inserted) {
      const extracted = await extractPayslipData(path, file.type);
      if (extracted) {
        await supabase.from("payslips").update({
          period_month: extracted.period_month ?? now.getMonth() + 1,
          period_year: extracted.period_year ?? now.getFullYear(),
          company_name: extracted.company_name ?? null,
          gross_salary: extracted.gross_salary ?? null,
          net_salary: extracted.net_salary ?? null,
          net_after_tax: extracted.net_salary ?? null,
          charges: extracted.charges ?? null,
          processed: true,
          processing_status: "completed",
        }).eq("id", inserted.id);
        await fetch();
      }
    }
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

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { payslips, loading, error, refetch: fetch, uploadPayslip, deletePayslip, downloadPayslip, updatePayslip };
}