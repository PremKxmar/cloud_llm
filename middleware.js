import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/doctors(.*)",
  "/onboarding(.*)",
  "/doctor(.*)",
  "/admin(.*)",
  "/video-call(.*)",
  "/appointments(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const path = req.nextUrl.pathname;

  // Special handling for doctor detail pages
  const doctorDetailMatch = path.match(/^\/doctors\/([^\/]+)\/([^\/]+)$/);
  if (doctorDetailMatch) {
    const specialty = doctorDetailMatch[1];
    const id = doctorDetailMatch[2];
    
    // If user is not authenticated and trying to access a doctor detail page,
    // redirect to sign-in with the current URL as redirect URL
    if (!userId && isProtectedRoute(req)) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', `/doctors/${specialty}/${id}`);
      return NextResponse.redirect(signInUrl);
    }
  }

  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
