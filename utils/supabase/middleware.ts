import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const DASHBOARD_PREFIX = "/dashboard";
const AUTH_PATHS = new Set(["/login", "/signup"]);

/**
 * Copies cookies set during `getUser()` (refresh) onto another response so redirects
 * keep a valid session (see Supabase SSR middleware guidance).
 */
function copyCookies(from: NextResponse, to: NextResponse) {
  for (const c of from.cookies.getAll()) {
    to.cookies.set(c.name, c.value);
  }
}

/**
 * Refreshes the Supabase Auth session and propagates updated cookies on the response.
 * Enforces: `/dashboard/*` requires a user; `/login` and `/signup` redirect signed-in users away.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user && pathname.startsWith(DASHBOARD_PREFIX)) {
    const redirectResponse = NextResponse.redirect(new URL("/login", request.url));
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  if (user && AUTH_PATHS.has(pathname)) {
    const redirectResponse = NextResponse.redirect(new URL("/dashboard/overview", request.url));
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  return supabaseResponse;
}
