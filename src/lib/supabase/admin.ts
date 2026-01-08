import { createClient } from "@supabase/supabase-js";

// WARNING: Only use in API routes and webhooks
// NEVER import this in client components or server components
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
