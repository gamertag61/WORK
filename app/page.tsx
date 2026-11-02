import { PublicToolList } from "@/components/PublicToolList";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6">
      <section className="py-16 text-center sm:py-24">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Borrow what you need. Lend what you don&apos;t
        </h1>
      </section>
      <section className="pb-16" aria-labelledby="catalog-title">
        <h2 id="catalog-title" className="mb-6 text-xl font-semibold">
          Herramientas disponibles
        </h2>
        <PublicToolList />
      </section>
    </main>
  );
}
