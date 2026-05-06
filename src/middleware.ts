import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Protect all pages except public ones and static assets like images
  matcher: [
    "/((?!api|login|register|forgot-password|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|about|shop|product|new-arrivals|contact).*)",
  ],
};
