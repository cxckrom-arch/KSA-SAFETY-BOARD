import Link from "next/link";
import { AlertTriangle, ArrowRight, BellRing, RefreshCcw } from "lucide-react";
import { OperationalHero, Panel, StatusBadge } from "@/components/ui/primitives";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AlertRecord = {
  id: string;
  event_key: string;
  violation_type: string;
  severity: string;
  status: string;
  confidence: number | null;
  zone: string | null;
  plant: string | null;
  detected_at: string;
  source_event_id: string | null;
  model_version: string | null;
  camera: { name: string; site: string | null }[] | null;
};

const severityTone: Record<string, "neutral" | "warning" | "danger" | "success" | "info"> = { low: "info", medium: "warning", high: "danger", critical: "danger" };
const statusTone: Record<string, "neutral" | "warning" | "danger" | "success" | "info"> = { open: "danger", acknowledged: "warning", under_review: "info", resolved: "success", false_positive: "neutral" };
function formatTimestamp(value: string) { return new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function label(value: string) { return value.replaceAll("_", " "); }

async function getAlerts(): Promise<{ rows: AlertRecord[]; error: string | null }> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { rows: [], error: "مصدر Supabase غير مهيأ في هذه البيئة." };
  const result = await supabase.from("vision_alerts").select("id,event_key,violation_type,severity,status,confidence,zone,plant,detected_at,source_event_id,model_version,camera:vision_cameras(name,site)").order("detected_at", { ascending: false }).limit(100);
  if (result.error) return { rows: [], error: "تعذر قراءة سجل التنبيهات من المصدر المصرح به." };
  return { rows: (result.data ?? []) as AlertRecord[], error: null };
}

export default async function VisionAlertsPage() {
  const { rows, error } = await getAlerts();
  return (
    <>
      <OperationalHero eyebrow="VISION ALERTS" title="سجل التنبيهات المرئية" description="عرض تدقيقي للتنبيهات الواردة من Vision. لا توجد إجراءات acknowledge أو resolve هنا قبل اعتماد state machine وaudit workflow على الخادم." action={<Link href="/admin/vision" className="button button-secondary"><ArrowRight size={16} />العودة إلى Vision</Link>} />
      <div className="directory-note"><BellRing size={17} /><span>الدقة ليست قرارًا بحد ذاتها: confidence دليل من النموذج، ويظل تصنيف التنبيه والتحقق الميداني مسؤولية المستخدم المخول.</span></div>
      <Panel>
        <div className="panel-header"><div><h2>التنبيهات</h2><p>{error ? "حالة القراءة غير متاحة" : rows.length ? `${rows.length} تنبيهًا في النطاق المصرح` : "لا توجد تنبيهات محفوظة"}</p></div><AlertTriangle size={20} color="var(--amber)" /></div>
        {error ? <div className="directory-state directory-error"><RefreshCcw size={21} /><div><strong>تعذر تحميل سجل التنبيهات</strong><span>{error}</span></div></div> : rows.length === 0 ? <div className="directory-state"><BellRing size={28} /><div><strong>لا توجد تنبيهات محفوظة</strong><span>لن يتم اختلاق أحداث PPE أو fire/smoke أو restricted-zone. عند وصول حدث حقيقي سيظهر مصدره، شدته، ثقته، وموقعه هنا.</span></div></div> : <div className="directory-table-wrap"><table className="directory-table"><thead><tr><th>التنبيه</th><th>المصدر</th><th>الموقع</th><th>الشدة</th><th>الحالة</th><th>الثقة</th><th>وقت الاكتشاف</th></tr></thead><tbody>{rows.map((alert) => { const camera = alert.camera?.[0]; return <tr key={alert.id}><td><strong>{alert.violation_type}</strong><small>{alert.event_key}{alert.model_version ? ` · Model ${alert.model_version}` : ""}{alert.source_event_id ? ` · Source ${alert.source_event_id}` : ""}</small></td><td>{camera?.name ?? "Camera unavailable"}<small>{camera?.site ?? "—"}</small></td><td>{alert.plant ?? "—"}<small>{alert.zone ?? "—"}</small></td><td><StatusBadge tone={severityTone[alert.severity] ?? "neutral"}>{label(alert.severity)}</StatusBadge></td><td><StatusBadge tone={statusTone[alert.status] ?? "neutral"}>{label(alert.status)}</StatusBadge></td><td>{alert.confidence === null ? "—" : `${alert.confidence}%`}</td><td>{formatTimestamp(alert.detected_at)}</td></tr>; })}</tbody></table></div>}
      </Panel>
    </>
  );
}
