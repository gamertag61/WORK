import { cardClass } from "@/lib/ui";

type ToolCardProps = {
  tool: {
    name: string;
    category: string;
    condition: string;
    description: string;
  };
};

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <article className={cardClass}>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {tool.category}
      </p>
      <h3 className="mt-1 font-semibold">{tool.name}</h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {tool.description}
      </p>
      <p className="mt-3 text-xs text-zinc-500">Estado: {tool.condition}</p>
    </article>
  );
}
