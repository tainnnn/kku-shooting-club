import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: CookieOptions;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 🔒 ต้อง login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // 🔒 admin only
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const { data, error } = await supabase
      .from("user")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !data || data.role !== "admin") {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
