import { db } from "@/db/dbclient";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Line from "next-auth/providers/line";

const providers: Provider[] = [
  GitHub({ allowDangerousEmailAccountLinking: true }),
  Google({ allowDangerousEmailAccountLinking: true }),
  Line({ allowDangerousEmailAccountLinking: true }),
];

export const providerMap = providers.map((provider) => {
  if (typeof provider === "function") {
    const providerData = provider();
    return { id: providerData.id, name: providerData.name };
  } else {
    return { id: provider.id, name: provider.name };
  }
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  // providers: [GitHub],
  providers,
  adapter: DrizzleAdapter(db),
  trustHost: true,
  // cookies: {
  //   sessionToken: {
  //     name: `__Secure-next-auth.session-token`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: "lax",
  //       path: "/",
  //       secure: true,
  //     },
  //   },
  // },
  pages: {
    signIn: "/auth/signin",
  },
});
