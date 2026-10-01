export type Permission =
  | "public"
  | "dashboard.view"
  | "notifications.read"
  | "settings.read"
  | "reports.print"
  | "vision.dashboard.view"
  | "vision.devices.view"
  | "vision.cameras.view"
  | "vision.alerts.read";

export type RouteRegistryEntry = {
  path: "/admin" | "/admin/vision" | "/admin/vision/devices" | "/admin/vision/cameras" | "/admin/vision/alerts" | "/admin/notifications" | "/admin/settings" | "/admin/print";
  title: string;
  eyebrow: string;
  description: string;
  permission: Permission;
  resource: string;
  sidebar: boolean;
  iconName: "layout-dashboard" | "scan-eye" | "server" | "camera" | "triangle-alert" | "bell" | "settings" | "printer";
};

export const routeRegistry: readonly RouteRegistryEntry[] = [
  {
    path: "/admin",
    title: "مركز القيادة",
    eyebrow: "COMMAND CENTER",
    description: "نظرة تشغيلية على ما يحتاج انتباهًا أو قرارًا.",
    permission: "dashboard.view",
    resource: "dashboard",
    sidebar: true,
    iconName: "layout-dashboard",
  },
  {
    path: "/admin/vision",
    title: "الرؤية التشغيلية",
    eyebrow: "SAFETY VISION",
    description: "حالة الكاميرات والأجهزة والتنبيهات المرئية دون ادعاء بث غير متصل.",
    permission: "vision.dashboard.view",
    resource: "vision_dashboard",
    sidebar: true,
    iconName: "scan-eye",
  },
  {
    path: "/admin/vision/devices",
    title: "أجهزة ESP",
    eyebrow: "ESP DEVICES",
    description: "دليل الأجهزة وحالتها وبيانات آخر نبضة دون كشف أسرار الجهاز.",
    permission: "vision.devices.view",
    resource: "vision_devices",
    sidebar: false,
    iconName: "server",
  },
  {
    path: "/admin/vision/cameras",
    title: "دليل الكاميرات",
    eyebrow: "CAMERA DIRECTORY",
    description: "بيانات الكاميرات وصحة الشبكة والبث والتحليلات بشكل منفصل.",
    permission: "vision.cameras.view",
    resource: "vision_cameras",
    sidebar: false,
    iconName: "camera",
  },
  {
    path: "/admin/vision/alerts",
    title: "تنبيهات Vision",
    eyebrow: "VISION ALERTS",
    description: "سجل التنبيهات المرئية مع المصدر والشدة والثقة والحالة.",
    permission: "vision.alerts.read",
    resource: "vision_alerts",
    sidebar: false,
    iconName: "triangle-alert",
  },
  {
    path: "/admin/notifications",
    title: "الإشعارات",
    eyebrow: "NOTIFICATIONS",
    description: "صندوق متابعة التنبيهات والإسنادات الخاصة بك.",
    permission: "notifications.read",
    resource: "notifications",
    sidebar: true,
    iconName: "bell",
  },
  {
    path: "/admin/settings",
    title: "الإعدادات",
    eyebrow: "SETTINGS",
    description: "تهيئة هوية المجلس وتفضيلات مساحة العمل.",
    permission: "settings.read",
    resource: "settings",
    sidebar: true,
    iconName: "settings",
  },
  {
    path: "/admin/print",
    title: "معاينة الطباعة",
    eyebrow: "PRINT SYSTEM",
    description: "قالب أبيض ثابت للمخرجات الرسمية.",
    permission: "reports.print",
    resource: "print",
    sidebar: false,
    iconName: "printer",
  },
] as const;

export const publicRoutes = [
  { path: "/", title: "KSA SAFETY BOARD" },
  { path: "/admin/login", title: "تسجيل الدخول" },
] as const;

export function getRouteEntry(pathname: string) {
  return routeRegistry.find((entry) => entry.path === pathname);
}

export function getSidebarRoutes() {
  return routeRegistry.filter((entry) => entry.sidebar);
}
