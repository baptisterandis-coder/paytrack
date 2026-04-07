"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Goal } from "@/utils/salary";

export function useGoals() {
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

  useEffect(() => { fetch(); }, [fetch]);

  return { goals, loading, createOrUpdateGoal, deleteGoal, refetch: fetch };
}