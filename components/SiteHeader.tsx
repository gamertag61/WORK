import { Suspense } from "react";
import Link from "next/link";
import { SignInCta } from "@/components/SignInCta";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          LendLoop
        </Link>
        <Suspense>
          <SignInCta />
        </Suspense>
      </div>
    </header>
  );
}
