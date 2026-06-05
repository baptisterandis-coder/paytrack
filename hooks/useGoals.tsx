"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Goal } from "@/utils/salary";

function useGoalsState() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("goals").select("*").eq("is_active", true).order("created_at", { ascending: false });
    setGoals((data ?? []) as Goal[]);
    setLoading(false);
  }, []);

  const createOrUpdateGoal = async (goalType: Goal["goal_type"], targetAmount: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const existing = goals.find(g => g.goal_type === goalType);
    if (existing) await supabase.from("goals").update({ is_active: false }).eq("id", existing.id);
    await supabase.from("goals").insert({ user_id: user.id, goal_type: goalType, target_amount: targetAmount, is_active: true });
    await fetch();
  };

  const deleteGoal = async (id: string) => {
    await supabase.from("goals").update({ is_active: false }).eq("id", id);
    await fetch();
  };

  // Chargement initial + temps réel : les objectifs se synchronisent
  // automatiquement avec le dashboard dès qu'ils changent.
  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      await fetch();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !active) return;
      channel = supabase
        .channel("goals-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "goals", filter: `user_id=eq.${user.id}` },
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

  return { goals, loading, createOrUpdateGoal, deleteGoal, refetch: fetch };
}

type GoalsContextValue = ReturnType<typeof useGoalsState>;
const GoalsContext = createContext<GoalsContextValue | null>(null);

export function GoalsProvider({ children }: { children: ReactNode }) {
  const value = useGoalsState();
  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
}

export function useGoals() {
  const ctx = useContext(GoalsContext);
  if (!ctx) throw new Error("useGoals doit être utilisé à l'intérieur d'un <GoalsProvider>");
  return ctx;
}
