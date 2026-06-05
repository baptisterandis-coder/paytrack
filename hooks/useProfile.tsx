"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Profile {
  id: string;
  full_name: string | null;
  birth_date: string | null;
  job_title: string | null;
  company: string | null;
  contract_type: string | null;
}

function useProfileState() {
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

  // Chargement initial + temps réel : le profil (nom, âge, poste…) affiché
  // dans l'en-tête se met à jour automatiquement après modification.
  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      await fetchProfile();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !active) return;
      channel = supabase
        .channel("profile-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
          () => { fetchProfile(); }
        )
        .subscribe();
    })();
    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProfile]);

  return { profile, loading, saveProfile, getAge, refetch: fetchProfile };
}

type ProfileContextValue = ReturnType<typeof useProfileState>;
const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const value = useProfileState();
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile doit être utilisé à l'intérieur d'un <ProfileProvider>");
  return ctx;
}
