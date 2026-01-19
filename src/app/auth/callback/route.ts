import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, error_description);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error_description || error)}`, origin)
    );
  }

  // Exchange code for session
  if (code) {
    const supabase = await createClient();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Error exchanging code for session:", exchangeError);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, origin)
      );
    }

    // Check if user profile exists and has phone number
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, phone")
        .eq("id", data.user.id)
        .single();

      if (!profile) {
        console.log("Profile not found for user, redirecting to login with error");
        return NextResponse.redirect(
          new URL("/login?error=Profile+not+created", origin)
        );
      }

      // If phone number is missing, redirect to complete profile
      if (!profile.phone) {
        console.log("Phone number missing, redirecting to complete-profile");
        const response = NextResponse.redirect(new URL("/complete-profile", origin));
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        return response;
      }
    }

    // Successfully authenticated with complete profile, redirect to home
    const response = NextResponse.redirect(new URL("/", origin));

    // Force refresh to update client-side state
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    return response;
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL("/login", origin));
}
