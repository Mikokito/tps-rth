import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Map route prefix → allowed roles
const ROUTE_ROLES: Array<{ prefix: string; roles: string[] }> = [
  { prefix: "/admin",   roles: ["admin"] },
  { prefix: "/manager", roles: ["manajer", "manager"] },
  { prefix: "/petugas", roles: ["petugas"] },
  { prefix: "/user",    roles: ["user"] },
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Build a response that refreshes session cookies on every request
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Only check auth for protected route prefixes
  const route = ROUTE_ROLES.find(({ prefix }) => pathname.startsWith(prefix));
  if (!route) return response;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = user.user_metadata?.role as string | undefined;
  if (!role || !route.roles.includes(role)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
