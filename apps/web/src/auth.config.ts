import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isLoginPage = nextUrl.pathname === "/login";

      if (isDashboard && !isLoggedIn) {
        return false;
      }

      if (isLoginPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard/home", nextUrl));
      }

      return true;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url;
      }
      if (url.startsWith("/")) {
        return new URL(url, baseUrl).toString();
      }
      return `${baseUrl}/dashboard/home`;
    },
  },
  providers: [],
};
