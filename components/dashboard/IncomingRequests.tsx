"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  cardClass,
  errorMessage,
  formatDate,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/lib/ui";

type NextStatus = Exclude<Doc<"requests">["status"], "pending">;

export function IncomingRequests() {
  const requests = useQuery(api.requests.listIncoming);
  const updateStatus = useMutation(api.requests.updateStatus);
  const [busyId, setBusyId] = useState<Id<"requests"> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function changeStatus(id: Id<"requests">, status: NextStatus) {
    setError(null);
    setBusyId(id);
    try {
      await updateStatus({ id, status });
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section aria-label="Solicitudes entrantes" className="space-y-3">
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {requests === undefined && (
        <p className="text-sm text-zinc-500">Cargando…</p>
      )}
      {requests?.length === 0 && (
        <p className="text-sm text-zinc-500">
          Nadie ha solicitado tus herramientas todavía.
        </p>
      )}
      {requests?.map((request) => (
        <article
          key={request._id}
          className={`${cardClass} flex flex-wrap items-center justify-between gap-4`}
        >
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">{request.toolName}</h3>
              <StatusBadge status={request.status} />
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {formatDate(request.startDate)} – {formatDate(request.endDate)}
            </p>
          </div>
          <div className="flex gap-2">
            {request.status === "pending" && (
              <>
                <button
                  type="button"
                  disabled={busyId === request._id}
                  className={secondaryButtonClass}
                  onClick={() => changeStatus(request._id, "rejected")}
                >
                  Rechazar
                </button>
                <button
                  type="button"
                  disabled={busyId === request._id}
                  className={primaryButtonClass}
                  onClick={() => changeStatus(request._id, "approved")}
                >
                  Aprobar
                </button>
              </>
            )}
            {request.status === "approved" && (
              <button
                type="button"
                disabled={busyId === request._id}
                className={secondaryButtonClass}
                onClick={() => changeStatus(request._id, "returned")}
              >
                Marcar como devuelta
              </button>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
