import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { primaryButtonClass } from "@/lib/ui";

export function SignInCta() {
  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button type="button" className={primaryButtonClass}>
            Sign in to lend or borrow
          </button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium hover:underline">
            Dashboard
          </Link>
          <UserButton />
        </div>
      </Show>
    </>
  );
}
