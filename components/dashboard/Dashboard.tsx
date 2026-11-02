"use client";

import { useState } from "react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { IncomingRequests } from "@/components/dashboard/IncomingRequests";
import { MyListings } from "@/components/dashboard/MyListings";
import { MyRequests } from "@/components/dashboard/MyRequests";

const TABS = [
  { id: "listings", label: "Mis listados", Panel: MyListings },
  { id: "requests", label: "Mis solicitudes", Panel: MyRequests },
  { id: "incoming", label: "Solicitudes entrantes", Panel: IncomingRequests },
];

export function Dashboard() {
  const [activeId, setActiveId] = useState(TABS[0].id);
  const active = TABS.find((tab) => tab.id === activeId) ?? TABS[0];

  return (
    <>
      <AuthLoading>
        <p className="text-sm text-zinc-500">Cargando tu sesión…</p>
      </AuthLoading>
      <Unauthenticated>
        <p className="text-sm text-zinc-500">
          No pudimos validar tu sesión. Recarga la página o vuelve a iniciar
          sesión.
        </p>
      </Unauthenticated>
      <Authenticated>
        <div
          role="tablist"
          aria-label="Secciones del dashboard"
          className="mb-8 flex gap-6 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={tab.id === active.id}
              aria-controls="dashboard-panel"
              onClick={() => setActiveId(tab.id)}
              className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
                tab.id === active.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-zinc-500 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id="dashboard-panel"
          aria-labelledby={`tab-${active.id}`}
        >
          <active.Panel />
        </div>
      </Authenticated>
    </>
  );
}
