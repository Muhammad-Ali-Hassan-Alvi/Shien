export const authConfig = {
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/seller-center");
      const isOnProfile = nextUrl.pathname.startsWith("/profile");
      const isOnAuth = nextUrl.pathname.startsWith("/auth");

      if (isOnAdmin) {
        if (isLoggedIn && auth.user.role === "admin") return true;
        return false; // Redirect to login
      }

      if (isOnProfile) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }

      if (isOnAuth) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user._id || user.id;

        console.log("JWT CALLBACK DEBUG:", {
          role: user.role,
          userType: user.userType,
          finalRole: (user.role === 'admin' || user.userType === 'admin') ? 'admin' : (user.role || 'user')
        });

        // Prioritize explicit role, fallback to userType
        token.role = (user.role === 'admin' || user.userType === 'admin') ? 'admin' : (user.role || 'user');
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
