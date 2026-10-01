import Link from "next/link";
import { ArrowRight, Camera, Radio, RefreshCcw } from "lucide-react";
import { OperationalHero, Panel, StatusBadge } from "@/components/ui/primitives";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type CameraRecord = { id: string; name: string; name_en: string | null; site: string | null; area: string | null; zone: string | null; camera_type: string; status: string; network_reachable: boolean | null; stream_healthy: boolean | null; analytics_healthy: boolean | null; recording_enabled: boolean; analytics_enabled: boolean; last_frame_at: string | null };

const statusTone: Record<string, "neutral" | "warning" | "danger" | "success" | "info"> = { online: "success", warning: "warning", degraded: "warning", offline: "danger", maintenance: "warning", disabled: "neutral", unknown: "neutral" };
function healthLabel(value: boolean | null) { return value === true ? "Healthy" : value === false ? "Failed" : "Unknown"; }
function healthTone(value: boolean | null): "neutral" | "warning" | "danger" | "success" { return value === true ? "success" : value === false ? "danger" : "neutral"; }
function formatTimestamp(value: string | null) { return value ? new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—"; }

async function getCameras(): Promise<{ rows: CameraRecord[]; error: string | null }> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { rows: [], error: "مصدر Supabase غير مهيأ في هذه البيئة." };
  const result = await supabase.from("vision_cameras").select("id,name,name_en,site,area,zone,camera_type,status,network_reachable,stream_healthy,analytics_healthy,recording_enabled,analytics_enabled,last_frame_at").order("updated_at", { ascending: false }).limit(100);
  if (result.error) return { rows: [], error: "تعذر قراءة دليل الكاميرات من المصدر المصرح به." };
  return { rows: (result.data ?? []) as CameraRecord[], error: null };
}

export default async function VisionCamerasPage() {
  const { rows, error } = await getCameras();
  return (
    <>
      <OperationalHero eyebrow="CAMERA DIRECTORY" title="دليل الكاميرات" description="معلومات الكاميرا وحالة الشبكة والبث والتحليلات منفصلة. لا يعرض هذا الدليل RTSP أو كلمات مرور أو رابطًا غير قابل للتشغيل في المتصفح." action={<Link href="/admin/vision" className="button button-secondary"><ArrowRight size={16} />العودة إلى Vision</Link>} />
      <div className="directory-note"><Radio size={17} /><span>البث المباشر يحتاج Gateway حقيقيًا يدعم WebRTC أو HLS/LL-HLS. وجود metadata أو RTSP reference لا يعني أن التشغيل متاح.</span></div>
      <Panel>
        <div className="panel-header"><div><h2>الكاميرات المسجلة</h2><p>{error ? "حالة القراءة غير متاحة" : rows.length ? `${rows.length} كاميرا في النطاق المصرح` : "لا توجد كاميرات مسجلة"}</p></div><Camera size={20} color="var(--amber)" /></div>
        {error ? <div className="directory-state directory-error"><RefreshCcw size={21} /><div><strong>تعذر تحميل دليل الكاميرات</strong><span>{error}</span></div></div> : rows.length === 0 ? <div className="directory-state"><Camera size={28} /><div><strong>لا توجد كاميرات بعد</strong><span>أضف الكاميرا بعد اعتماد الموقع، gateway، حالة التسجيل، وحالة التحليلات. لا يتم عرض tile أسود على أنه بث مباشر.</span></div></div> : <div className="directory-table-wrap"><table className="directory-table"><thead><tr><th>الكاميرا</th><th>الموقع</th><th>الحالة</th><th>Network</th><th>Stream</th><th>Analytics</th><th>آخر إطار</th></tr></thead><tbody>{rows.map((camera) => <tr key={camera.id}><td><strong>{camera.name}</strong><small>{camera.name_en ?? camera.camera_type}{camera.recording_enabled ? " · Recording" : ""}{camera.analytics_enabled ? " · AI" : ""}</small></td><td>{camera.site ?? "—"}{camera.area || camera.zone ? <small>{[camera.area, camera.zone].filter(Boolean).join(" · ")}</small> : null}</td><td><StatusBadge tone={statusTone[camera.status] ?? "neutral"}>{camera.status}</StatusBadge></td><td><StatusBadge tone={healthTone(camera.network_reachable)}>{healthLabel(camera.network_reachable)}</StatusBadge></td><td><StatusBadge tone={healthTone(camera.stream_healthy)}>{healthLabel(camera.stream_healthy)}</StatusBadge></td><td><StatusBadge tone={healthTone(camera.analytics_healthy)}>{healthLabel(camera.analytics_healthy)}</StatusBadge></td><td>{formatTimestamp(camera.last_frame_at)}</td></tr>)}</tbody></table></div>}
      </Panel>
    </>
  );
}
