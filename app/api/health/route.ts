import { jsonOk } from "@/lib/api/response";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET() {
  return jsonOk({
    status: "ok",
    service: "ksa-safety-board",
    supabaseConfigured: isSupabaseConfigured(),
    timestamp: new Date().toISOString(),
  });
}
