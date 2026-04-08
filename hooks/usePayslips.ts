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

  const uploadPayslip = async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: up } = await supabase.storage.from("payslips").upload(path, file);
    if (up) throw up;
    const now = new Date();
    const { error: ins } = await supabase.from("payslips").insert({
      user_id: user.id, file_name: file.name, file_path: path, file_size: file.size,
      period_month: now.getMonth() + 1, period_year: now.getFullYear(),
      processed: false, processing_status: "pending",
    });
    if (ins) throw ins;
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
    await supabase.from("payslips").update({ ...updates, processed: true, processing_status: "completed" }).eq("id", id);
    await fetch();
  };

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { payslips, loading, error, refetch: fetch, uploadPayslip, deletePayslip, downloadPayslip, updatePayslip };
}