"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  cardClass,
  errorMessage,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/lib/ui";

const PAGE_SIZE = 100;

export function RequestLoanForm() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.tools.list,
    {},
    { initialNumItems: PAGE_SIZE },
  );
  const createRequest = useMutation(api.requests.create);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const borrowableTools = results.filter((tool) => !tool.isMine);
  const today = new Date().toLocaleDateString("en-CA");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setError(null);
    setIsSubmitting(true);
    try {
      await createRequest({
        toolId: String(data.get("toolId")) as Id<"tools">,
        // Date-only strings parse as UTC midnight.
        startDate: Date.parse(String(data.get("startDate"))),
        endDate: Date.parse(String(data.get("endDate"))),
      });
      form.reset();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${cardClass} space-y-4`}>
      <h2 className="font-semibold">Solicitar préstamo</h2>
      <label className="block space-y-1 text-sm">
        <span>Herramienta</span>
        <select name="toolId" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            {status === "LoadingFirstPage"
              ? "Cargando…"
              : "Selecciona una herramienta"}
          </option>
          {borrowableTools.map((tool) => (
            <option key={tool._id} value={tool._id}>
              {tool.name}
            </option>
          ))}
        </select>
      </label>
      {status === "CanLoadMore" && (
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={() => loadMore(PAGE_SIZE)}
        >
          Cargar más herramientas
        </button>
      )}
      <label className="block space-y-1 text-sm">
        <span>Desde</span>
        <input
          type="date"
          name="startDate"
          required
          min={today}
          className={inputClass}
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span>Hasta</span>
        <input
          type="date"
          name="endDate"
          required
          min={today}
          className={inputClass}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`${primaryButtonClass} w-full`}
      >
        {isSubmitting ? "Enviando…" : "Enviar solicitud"}
      </button>
    </form>
  );
}
