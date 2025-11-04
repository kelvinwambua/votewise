// @ts-nocheck
import { expo } from "@better-auth/expo";
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { api, components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { createAuthMiddleware } from "better-auth/plugins";
import { ConvexHttpClient } from "convex/browser";
const convexClient = new ConvexHttpClient(
  "https://polite-hornet-266.convex.cloud",
);

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false },
) => {
  return betterAuth({
    logger: {
      disabled: optionsOnly,
    },
    trustedOrigins: ["votewisemobile://"],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    hooks: {
      after: createAuthMiddleware(async (ctx) => {
        console.log("Auth middleware triggered for path:", ctx.path);

        if (
          ctx.path.startsWith("/callback/") ||
          ctx.path.startsWith("/sign-up")
        ) {
          const newSession = ctx.context.newSession;
          console.log("New session created:", newSession);

          if (newSession) {
            try {
              await convexClient.mutation(api.dashboard.createUser, {
                authId: newSession.user.id,
                name: newSession.user.name,
                email: newSession.user.email,
              });

              console.log(
                "Contact created successfully for:",
                newSession.user.email,
              );
            } catch (error) {
              console.error("Error creating contact:", error);
            }
          }
        }
      }),
    },

    plugins: [expo(), convex()],
  });
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
