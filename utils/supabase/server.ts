import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "./config";

export function createClient(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch (error) {
          console.error(
            "Could not update Supabase cookies while rendering a Server Component. Ensure proxy.ts is refreshing sessions.",
            error,
          );
        }
      },
    },
  });
}
