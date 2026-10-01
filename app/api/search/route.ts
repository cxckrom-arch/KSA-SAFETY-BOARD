import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api/response";
import { routeRegistry } from "@/lib/route-registry";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length > 120) return jsonError(422, "VALIDATION_ERROR", "Search query is too long.");

  const normalized = query.toLocaleLowerCase();
  const results = routeRegistry
    .filter((route) => !normalized || `${route.title} ${route.eyebrow} ${route.resource}`.toLocaleLowerCase().includes(normalized))
    .map(({ path, title, eyebrow, permission, resource }) => ({ path, title, eyebrow, permission, resource }));

  return jsonOk({ results });
}
