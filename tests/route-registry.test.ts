import { describe, expect, it } from "vitest";
import { getSidebarRoutes, routeRegistry } from "@/lib/route-registry";

describe("route registry", () => {
  it("keeps every sidebar entry mapped to a known route", () => {
    const registryPaths = new Set(routeRegistry.map((route) => route.path));
    expect(getSidebarRoutes().every((route) => registryPaths.has(route.path))).toBe(true);
  });

  it("does not expose duplicate registered paths", () => {
    const paths = routeRegistry.map((route) => route.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("registers Safety Vision with its protected resource and permission", () => {
    expect(routeRegistry).toContainEqual(expect.objectContaining({
      path: "/admin/vision",
      permission: "vision.dashboard.view",
      resource: "vision_dashboard",
      sidebar: true,
    }));
  });
});
