export const authConfig = {
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role || auth?.user?.userType || auth?.role;

      const isOnAdmin = nextUrl.pathname.startsWith("/seller-center");
      const isOnAuth = nextUrl.pathname.startsWith("/auth") || nextUrl.pathname.startsWith("/admin/login");

      // 1. Protection for Admin Routes
      if (isOnAdmin) {
        if (isLoggedIn && userRole === "admin") return true;

        // Custom Redirect: Send unauth admins to the dedicated Admin Login, NOT the user login
        return Response.redirect(new URL("/admin/login", nextUrl));
      }

      // 2. Redirect logged-in users away from Auth pages
      if (isOnAuth) {
        if (isLoggedIn) {
          if (userRole === "admin") {
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

        // Normalize Role
        const role = user.role || user.userType || 'user';

        console.log("JWT CALLBACK:", {
          id: user.id,
          roleInput: user.role,
          typeInput: user.userType,
          finalRole: role
        });

        token.role = role;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  providers: [], // Pure config for Edge
};
