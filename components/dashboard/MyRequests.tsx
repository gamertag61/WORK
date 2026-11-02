"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RequestLoanForm } from "@/components/dashboard/RequestLoanForm";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { cardClass, formatDate } from "@/lib/ui";

export function MyRequests() {
  const requests = useQuery(api.requests.listMine);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_20rem]">
      <section aria-label="Tus solicitudes" className="space-y-3">
        {requests === undefined && (
          <p className="text-sm text-zinc-500">Cargando…</p>
        )}
        {requests?.length === 0 && (
          <p className="text-sm text-zinc-500">
            Aún no has solicitado ningún préstamo.
          </p>
        )}
        {requests?.map((request) => (
          <article
            key={request._id}
            className={`${cardClass} flex items-center justify-between gap-4`}
          >
            <div>
              <h3 className="font-semibold">{request.toolName}</h3>
              <p className="mt-1 text-sm text-zinc-500">
                {formatDate(request.startDate)} – {formatDate(request.endDate)}
              </p>
            </div>
            <StatusBadge status={request.status} />
          </article>
        ))}
      </section>
      <RequestLoanForm />
    </div>
  );
}
