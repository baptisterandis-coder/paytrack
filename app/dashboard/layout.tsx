"use client";

import type { ReactNode } from "react";
import { PayslipsProvider } from "@/hooks/usePayslips";
import { GoalsProvider } from "@/hooks/useGoals";
import { ProfileProvider } from "@/hooks/useProfile";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <PayslipsProvider>
      <GoalsProvider>
        <ProfileProvider>{children}</ProfileProvider>
      </GoalsProvider>
    </PayslipsProvider>
  );
}
