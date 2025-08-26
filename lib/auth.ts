import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { polar, checkout, portal } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { trackUserSignup } from "./user-tracking";
import { eq, sql } from "drizzle-orm";
import { user as UserSchema, account as AccountSchema } from "@/lib/db/schema";

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN as string,
  server: 'sandbox'
});

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (updates session every day)
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            // Track user signup event for all new users (email/password and social)
            await trackUserSignup(user.email, user.name);
          } catch (error) {
            console.error("Error tracking user signup:", error);
            // Don't throw error to prevent breaking user creation
          }
        },
      },
    },
    account: {
      create: {
        after: async (account) => {
          try {
            // Track social signup for new accounts created via OAuth providers
            if (account.providerId === "google") {
              // Use raw SQL to check if this is a new social signup
              const userResult = await db.select().from(UserSchema).where(eq(UserSchema.id, account.userId)).limit(1);
              const user = userResult[0];
              
              if (user) {
                // Check if this is the user's first account (indicating a new signup)
                const accountCount = await db.select({ count: sql`count(*)` }).from(AccountSchema).where(eq(AccountSchema.userId, account.userId));
                
                // If this is the only account for this user, it's a new social signup
                if (accountCount[0]?.count === 1) {
                  await trackUserSignup(user.email, user.name);
                }
              }
            }
          } catch (error) {
            console.error("Error tracking social signup:", error);
            // Don't throw error to prevent breaking account creation
          }
        },
      },
    },
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: process.env.NEXT_PUBLIC_POLAR_MONTHLY_PRO_PRODUCT_ID as string,
              slug: "monthly-pro"
            },
            {
              productId: process.env.NEXT_PUBLIC_POLAR_MONTHLY_PLUS_PRODUCT_ID as string,
              slug: "monthly-plus"
            },
            {
              productId: process.env.NEXT_PUBLIC_POLAR_YEARLY_PRO_PRODUCT_ID as string,
              slug: "yearly-pro"
            },
            {
              productId: process.env.NEXT_PUBLIC_POLAR_YEARLY_PLUS_PRODUCT_ID as string,
              slug: "yearly-plus"
            }
          ],
          successUrl: "/premium/dashboard?checkout_success=true",
          authenticatedUsersOnly: true
        }),
        portal()
      ],
    })
  ]
});

export type Session = typeof auth.$Infer.Session;