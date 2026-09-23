import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function withSessionCookies(
  response: NextResponse,
  sessionResponse: NextResponse,
) {
  sessionResponse.cookies
    .getAll()
    .forEach((cookie) => response.cookies.set(cookie));

  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = sessionResponse.headers.get(header);
    if (value) response.headers.set(header, value);
  }

  return response;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims verifies the JWT; getSession only reads the unverified cookie.
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);
  const { pathname } = request.nextUrl;

  if (
    !isAuthenticated &&
    !(pathname.startsWith("/login") || pathname.startsWith("/register"))
  ) {
    if (pathname.startsWith("/api/")) {
      return withSessionCookies(
        NextResponse.json(
          {
            data: null,
            error: {
              code: "UNAUTHENTICATED",
              message: "Authentication is required.",
            },
          },
          { status: 401 },
        ),
        response,
      );
    }

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return withSessionCookies(NextResponse.redirect(url), response);
  }

  if (
    isAuthenticated &&
    (pathname.startsWith("/login") || pathname.startsWith("/register"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return withSessionCookies(NextResponse.redirect(url), response);
  }

  return response;
}
