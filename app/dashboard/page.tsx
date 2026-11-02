import { Suspense } from "react";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const metadata: Metadata = { title: "Dashboard | LendLoop" };

/** Redirects to sign-in when there is no session. */
async function ProtectedDashboard() {
  await auth.protect();
  return <Dashboard />;
}

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Dashboard</h1>
      <Suspense>
        <ProtectedDashboard />
      </Suspense>
    </main>
  );
}
