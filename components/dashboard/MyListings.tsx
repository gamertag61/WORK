"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AddToolForm } from "@/components/dashboard/AddToolForm";
import { ToolCard } from "@/components/ToolCard";

export function MyListings() {
  const tools = useQuery(api.tools.listMine);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_20rem]">
      <section aria-label="Tus herramientas">
        {tools === undefined && (
          <p className="text-sm text-zinc-500">Cargando…</p>
        )}
        {tools?.length === 0 && (
          <p className="text-sm text-zinc-500">
            Aún no has publicado herramientas. Agrega la primera.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {tools?.map((tool) => <ToolCard key={tool._id} tool={tool} />)}
        </div>
      </section>
      <AddToolForm />
    </div>
  );
}
