import type { Doc } from "@/convex/_generated/dataModel";

const STATUS_DISPLAY: Record<
  Doc<"requests">["status"],
  { label: string; className: string }
> = {
  pending: {
    label: "Pendiente",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  approved: {
    label: "Aprobada",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  rejected: {
    label: "Rechazada",
    className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  },
  returned: {
    label: "Devuelta",
    className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
};

export function StatusBadge({ status }: { status: Doc<"requests">["status"] }) {
  const { label, className } = STATUS_DISPLAY[status];
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
