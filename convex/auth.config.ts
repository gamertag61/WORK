import type { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Set in the Convex deployment, not in .env.local.
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
