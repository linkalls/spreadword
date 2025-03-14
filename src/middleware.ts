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
  ];

  if (!req.auth && !publicPages.includes(req.nextUrl.pathname)) {
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
     */
    "/((?!api|_next/static|_next/image|favicon.ico|auth|.*\\..*|$).*)",
  ],
};
