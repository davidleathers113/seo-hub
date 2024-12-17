import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth/next";
import EmailProvider from "next-auth/providers/email";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ExtendedUser {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.SMTP_FROM,
      async sendVerificationRequest({ identifier: email, url }) {
        // Create or update Supabase user
        const { data: supabaseUser, error: supabaseError } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { nextauth_verification_url: url }
        });

        if (supabaseError && supabaseError.message !== "User already registered") {
          throw new Error(`Error creating Supabase user: ${supabaseError.message}`);
        }

        // Send verification email using configured SMTP
        const { host } = new URL(url);
        await fetch(process.env.SMTP_HOST!, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: email,
            subject: `Sign in to ${host}`,
            text: `Click here to sign in: ${url}`,
            html: `
              <body>
                <h1>Sign in to ${host}</h1>
                <p>Click the link below to sign in:</p>
                <a href="${url}">Sign in</a>
              </body>
            `,
          }),
        });
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session }) {
      if (session?.user?.email) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.user.email)
          .single()

        if (userData) {
          return {
            ...session,
            user: {
              ...session.user,
              id: userData.id
            } as ExtendedUser
          }
        }
      }
      return session
    },
    async signIn({ user }) {
      // Sync with Supabase
      if (user.email) {
        const user = await supabase.auth.admin.listUsers({
          filter: {
            email: 'eq.' + user.email
          }
        }).then(({ data }) => data?.users[0])

        if (!user) {
          // Create Supabase user if doesn't exist
          const { error: createError } = await supabase.auth.admin.createUser({
            email: user.email,
            email_confirm: true,
          });

          if (createError) {
            console.error("Error creating Supabase user:", createError);
            return false;
          }
        }
      }

      return true;
    },
  },
  events: {
    async signOut({ session }) {
      if (session?.user?.email) {
        // Sign out from Supabase
        const { error } = await supabase.auth.admin.signOut(session.user.email);
        if (error) {
          console.error("Error signing out from Supabase:", error);
        }
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
