import {
  NextRequest,
  NextResponse,
} from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
  });

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");

  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");

  // If user is authenticated and tries to access login/register, redirect to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is not authenticated and tries to access dashboard, redirect to login
  if (isDashboard && !token) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the original search params and pathname
    loginUrl.search = request.nextUrl.search;
    return NextResponse.redirect(loginUrl);
  }

  // For all other routes, continue processing
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|api/).*)",
  ],
};
