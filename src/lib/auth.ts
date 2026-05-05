import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
        name: { label: "Name", type: "text" },
        isSignup: { label: "Is Signup", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) {
          throw new Error("Phone and OTP are required");
        }

        // 1. Retrieve stored OTP record
        const otpRecord = await prisma.otpVerification.findUnique({
          where: { phone: credentials.phone },
        });

        if (!otpRecord) {
          throw new Error("OTP not found. Please request a new one.");
        }

        // 2. Check expiry
        if (new Date() > otpRecord.expiresAt) {
          await prisma.otpVerification.delete({ where: { phone: credentials.phone } });
          throw new Error("OTP has expired. Please request a new one.");
        }

        // 3. Verify OTP hash
        const isValid = await bcrypt.compare(credentials.otp, otpRecord.otp);
        if (!isValid) {
          throw new Error("Invalid OTP. Please try again.");
        }

        // 4. Delete the used OTP
        await prisma.otpVerification.delete({ where: { phone: credentials.phone } });

        // 5. Find or create user
        let user = await prisma.user.findUnique({
          where: { phone: credentials.phone },
        });

        if (!user) {
          // New user — create account with name if provided
          user = await prisma.user.create({
            data: {
              phone: credentials.phone,
              name: credentials.name || "Customer",
              role: "CUSTOMER",
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
