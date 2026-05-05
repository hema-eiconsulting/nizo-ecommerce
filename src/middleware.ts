import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Protect all pages except public ones
  matcher: [
    "/((?!api|login|register|_next/static|_next/image|favicon.ico|about|shop|product|new-arrivals|contact).*)",
  ],
};
