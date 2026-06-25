export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role || auth?.user?.userType || auth?.role;
      const isAdminUser =
        userRole === "admin" || auth?.user?.collection === "admin";

      const isOnAdmin = nextUrl.pathname.startsWith("/seller-center");
      const isOnAuth = nextUrl.pathname.startsWith("/auth") || nextUrl.pathname.startsWith("/admin/login");

      // 1. Protection for Admin Routes
      if (isOnAdmin) {
        if (isLoggedIn && isAdminUser) return true;

        // Custom Redirect: Send unauth admins to the dedicated Admin Login, NOT the user login
        return Response.redirect(new URL("/admin/login", nextUrl));
      }

      // 2. Redirect logged-in users away from Auth pages
      if (isOnAuth) {
        if (isLoggedIn) {
          if (isAdminUser) {
            return Response.redirect(new URL("/seller-center", nextUrl));
          }
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = (user._id || user.id).toString();

        const role = user.role || user.userType || "user";

        token.role = role;
        if (user.collection) token.collection = user.collection;
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        if (token.collection) session.user.collection = token.collection;
        if (token.email) session.user.email = token.email;
        if (token.name) session.user.name = token.name;
      }
      return session;
    },
  },
  providers: [], // Pure config for Edge
};
