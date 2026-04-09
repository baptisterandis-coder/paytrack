"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Profile {
  id: string;
  full_name: string | null;
  birth_date: string | null;
  job_title: string | null;
  company: string | null;
  contract_type: string | null;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setProfile(data ?? null);
    setLoading(false);
  }, []);

  const saveProfile = async (updates: Partial<Profile>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: existing } = await supabase.from("profiles").select("id").eq("id", user.id).single();
    if (existing) {
      await supabase.from("profiles").update(updates).eq("id", user.id);
    } else {
      await supabase.from("profiles").insert({ id: user.id, ...updates });
    }
    await fetchProfile();
  };

  const getAge = () => {
    if (!profile?.birth_date) return null;
    const today = new Date();
    const birth = new Date(profile.birth_date);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  return { profile, loading, saveProfile, getAge, refetch: fetchProfile };
}