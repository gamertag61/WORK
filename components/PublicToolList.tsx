"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ToolCard } from "@/components/ToolCard";
import { secondaryButtonClass } from "@/lib/ui";

const PAGE_SIZE = 12;

export function PublicToolList() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.tools.list,
    {},
    { initialNumItems: PAGE_SIZE },
  );

  if (status === "LoadingFirstPage") {
    return <p className="text-sm text-zinc-500">Cargando herramientas…</p>;
  }
  if (results.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Todavía no hay herramientas publicadas.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((tool) => (
          <ToolCard key={tool._id} tool={tool} />
        ))}
      </div>
      {status !== "Exhausted" && (
        <div className="mt-8 text-center">
          <button
            type="button"
            className={secondaryButtonClass}
            disabled={status !== "CanLoadMore"}
            onClick={() => loadMore(PAGE_SIZE)}
          >
            Ver más
          </button>
        </div>
      )}
    </>
  );
}
