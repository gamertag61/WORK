import { ConvexError } from "convex/values";

export const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-background px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700";

export const primaryButtonClass =
  "rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50";

export const secondaryButtonClass =
  "rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800";

export const cardClass =
  "rounded-xl border border-zinc-200 bg-background p-5 dark:border-zinc-800";

const SERVER_ERRORS: Record<string, string> = {
  "Not authenticated": "Tu sesión expiró. Vuelve a iniciar sesión.",
  "Not authorized": "No tienes permiso para hacer esto.",
  "Tool not found": "Esta herramienta ya no existe.",
  "Request not found": "Esta solicitud ya no existe.",
  "You cannot borrow your own tool": "No puedes pedir prestada tu herramienta.",
  "End date must not be before start date":
    "La fecha de fin no puede ser anterior a la de inicio.",
  "Start date must not be in the past":
    "La fecha de inicio no puede estar en el pasado.",
  "Tool is already lent on those dates":
    "La herramienta ya está prestada en esas fechas.",
};

export function errorMessage(error: unknown) {
  if (error instanceof ConvexError && typeof error.data === "string") {
    return SERVER_ERRORS[error.data] ?? error.data;
  }
  return "Algo salió mal. Inténtalo de nuevo.";
}

/** Dates are stored as UTC midnight, so they must be shown in UTC. */
export function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
