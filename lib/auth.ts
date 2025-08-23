import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/src/lib/db";
import { polar, checkout, portal } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";

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
export type User = typeof auth.$Infer.User;