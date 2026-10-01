import Link from "next/link";
import { AlertTriangle, Camera, Cpu, Map, Radio, ScanEye, Settings2, ShieldAlert } from "lucide-react";
import { OperationalHero, Panel, StatusBadge } from "@/components/ui/primitives";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type CountState = { value: number | null; label: string };

async function getVisionCounts(): Promise<{ cameras: CountState; devices: CountState; alerts: CountState }> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return {
      cameras: { value: null, label: "مصدر البيانات غير مهيأ" },
      devices: { value: null, label: "مصدر البيانات غير مهيأ" },
      alerts: { value: null, label: "مصدر البيانات غير مهيأ" },
    };
  }

  const [cameras, devices, alerts] = await Promise.all([
    supabase.from("vision_cameras").select("id", { count: "exact", head: true }),
    supabase.from("vision_devices").select("id", { count: "exact", head: true }),
    supabase.from("vision_alerts").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);

  const unavailable = [cameras.error, devices.error, alerts.error].some(Boolean);
  if (unavailable) {
    return {
      cameras: { value: null, label: "غير متاح أو لا توجد صلاحية" },
      devices: { value: null, label: "غير متاح أو لا توجد صلاحية" },
      alerts: { value: null, label: "غير متاح أو لا توجد صلاحية" },
    };
  }

  return {
    cameras: { value: cameras.count ?? 0, label: cameras.count === 0 ? "لا توجد كاميرات مسجلة" : "كاميرات مسجلة" },
    devices: { value: devices.count ?? 0, label: devices.count === 0 ? "لا توجد أجهزة Edge مسجلة" : "أجهزة Edge مسجلة" },
    alerts: { value: alerts.count ?? 0, label: alerts.count === 0 ? "لا توجد تنبيهات مفتوحة" : "تنبيهات مفتوحة" },
  };
}

function VisionMetric({ icon: Icon, title, item, tone }: { icon: typeof Camera; title: string; item: CountState; tone: "info" | "warning" | "danger" }) {
  return (
    <div className="vision-metric">
      <div className={`vision-metric-icon vision-${tone}`}><Icon size={18} /></div>
      <div><span>{title}</span><strong>{item.value === null ? "—" : item.value}</strong><small>{item.label}</small></div>
    </div>
  );
}

export default async function SafetyVisionPage() {
  const counts = await getVisionCounts();
  const connected = counts.cameras.value !== null;

  return (
    <>
      <OperationalHero
        eyebrow="SAFETY VISION"
        title="الرؤية قبل القرار"
        description="مركز مراقبة يميز بين حالة الشبكة، صحة البث، وصحة التحليلات. لا تظهر بثًا مباشرًا أو تنبيهًا ما لم يصل من مصدر حقيقي."
        action={<Link href="/admin/settings" className="button button-secondary"><Settings2 size={16} />تهيئة المصدر</Link>}
      />

      <div className="vision-status-strip">
        <div><span className="eyebrow">VISION SOURCE</span><strong>{connected ? "Supabase schema connected" : "Vision source not available"}</strong></div>
        <StatusBadge tone={connected ? "success" : "warning"}>{connected ? "Schema reachable" : "Not connected"}</StatusBadge>
      </div>

      <section className="vision-metrics" aria-label="مؤشرات Safety Vision">
        <VisionMetric icon={Camera} title="الكاميرات" item={counts.cameras} tone="info" />
        <VisionMetric icon={Cpu} title="أجهزة Edge" item={counts.devices} tone="warning" />
        <VisionMetric icon={ShieldAlert} title="التنبيهات المفتوحة" item={counts.alerts} tone="danger" />
      </section>

      <div className="vision-grid">
        <Panel>
          <div className="panel-header"><div><h2>حائط الكاميرات</h2><p>اختر 1×1 أو 2×2 أو 3×3 أو 4×4 عند توفر بث WebRTC/HLS فعلي.</p></div><ScanEye size={20} color="var(--amber)" /></div>
          <div className="vision-wall-empty">
            <Radio size={28} />
            <h3>لا يوجد بث قابل للعرض</h3>
            <p>لم يتم تسجيل كاميرات أو لم يتم ربط Gateway يدعم تشغيل المتصفح. لن يتم عرض إطار أسود على أنه Live.</p>
            <div className="vision-state-list"><span><i className="vision-dot vision-dot-neutral" />Unknown</span><span><i className="vision-dot vision-dot-warning" />Degraded</span><span><i className="vision-dot vision-dot-danger" />Offline</span></div>
          </div>
        </Panel>

        <Panel>
          <div className="panel-header"><div><h2>سلامة التشغيل</h2><p>الفصل بين الشبكة والبث والتحليلات</p></div><AlertTriangle size={20} color="var(--amber)" /></div>
          <div className="vision-health-list">
            <div><span>Network reachable</span><StatusBadge tone="neutral">غير معروف</StatusBadge></div>
            <div><span>Video stream healthy</span><StatusBadge tone="neutral">غير معروف</StatusBadge></div>
            <div><span>AI analytics healthy</span><StatusBadge tone="neutral">غير معروف</StatusBadge></div>
            <div><span>Last heartbeat</span><strong>—</strong></div>
          </div>
        </Panel>

        <Panel>
          <div className="panel-header"><div><h2>مسارات Vision</h2><p>أدلة القراءة متاحة؛ إجراءات التسجيل والتشغيل تحتاج provisioning معتمد</p></div></div>
          <div className="vision-link-list">
            <Link href={"/admin/vision/cameras" as never}><Camera size={17} /><span>Camera directory</span><StatusBadge tone="info">Implemented</StatusBadge></Link>
            <Link href={"/admin/vision/devices" as never}><Cpu size={17} /><span>ESP devices</span><StatusBadge tone="info">Implemented</StatusBadge></Link>
            <div><Map size={17} /><span>Facility map & zones</span><StatusBadge tone="neutral">Planned</StatusBadge></div>
          </div>
        </Panel>
      </div>
    </>
  );
}
