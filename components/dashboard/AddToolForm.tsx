"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  cardClass,
  errorMessage,
  inputClass,
  primaryButtonClass,
} from "@/lib/ui";

const CONDITIONS = ["Nueva", "Muy buena", "Buena", "Aceptable"];

export function AddToolForm() {
  const createTool = useMutation(api.tools.create);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setError(null);
    setIsSubmitting(true);
    try {
      await createTool({
        name: String(data.get("name")).trim(),
        category: String(data.get("category")).trim(),
        condition: String(data.get("condition")),
        description: String(data.get("description")).trim(),
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
      <h2 className="font-semibold">Agregar herramienta</h2>
      <label className="block space-y-1 text-sm">
        <span>Nombre</span>
        <input name="name" required maxLength={100} className={inputClass} />
      </label>
      <label className="block space-y-1 text-sm">
        <span>Categoría</span>
        <input
          name="category"
          required
          maxLength={50}
          placeholder="Jardinería, carpintería…"
          className={inputClass}
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span>Estado</span>
        <select name="condition" required className={inputClass}>
          {CONDITIONS.map((condition) => (
            <option key={condition}>{condition}</option>
          ))}
        </select>
      </label>
      <label className="block space-y-1 text-sm">
        <span>Descripción</span>
        <textarea
          name="description"
          required
          maxLength={500}
          rows={3}
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
        {isSubmitting ? "Publicando…" : "Publicar herramienta"}
      </button>
    </form>
  );
}
