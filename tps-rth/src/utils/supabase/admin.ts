import { createClient } from "@supabase/supabase-js";

// Server-only admin client — bypasses RLS for trusted server-side reads.
// NEVER import this in client components or expose to the browser.
export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
