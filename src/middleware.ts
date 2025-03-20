import { auth } from "@/auth";

export default auth((req) => {
  // パブリックページの配列
  const publicPages = [
    "/",
    "/about",
    "/contact",
    "/pricing",
    "/features",
    "contact",
    "/demo",
    "/terms",
    "/terms/privacy",
    "/blog",
  ];

  const pathname = req.nextUrl.pathname;

  // Check if the path is public or starts with /wordlists/share/
  if (
    !req.auth &&
    !publicPages.includes(pathname) &&
    !pathname.startsWith("/wordlists/share/")
  ) {
    const newUrl = new URL("/auth/signin", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (authentication routes)
     * - public files
     * - files with extensions (e.g. .js, .css, .png)
     * - root path (/)
     * - about
     * - contact
     * - pricing
     * - features
     * - contact
     * - /wordlists/share/[id]
     */
    "/((?!api|_next/static|_next/image|favicon.ico|auth|.*\\..*|$).*)",
  ],
};
