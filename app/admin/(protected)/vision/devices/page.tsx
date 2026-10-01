import Link from "next/link";
import { ArrowRight, Cpu, RefreshCcw, Server } from "lucide-react";
import { OperationalHero, Panel, StatusBadge } from "@/components/ui/primitives";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Device = {
  id: string;
  name: string;
  device_identifier: string;
  device_type: string;
  site: string | null;
  zone: string | null;
  status: string;
  firmware_version: string | null;
  heartbeat_at: string | null;
  temperature_c: number | null;
  network_quality: string | null;
};

const statusTone: Record<string, "neutral" | "warning" | "danger" | "success" | "info"> = {
  active: "success", degraded: "warning", offline: "danger", provisioning: "info", maintenance: "warning", revoked: "danger", retired: "neutral", registered: "neutral",
};

function formatTimestamp(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

async function getDevices(): Promise<{ rows: Device[]; error: string | null }> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { rows: [], error: "مصدر Supabase غير مهيأ في هذه البيئة." };
  const result = await supabase.from("vision_devices").select("id,name,device_identifier,device_type,site,zone,status,firmware_version,heartbeat_at,temperature_c,network_quality").order("updated_at", { ascending: false }).limit(100);
  if (result.error) return { rows: [], error: "تعذر قراءة دليل الأجهزة من المصدر المصرح به." };
  return { rows: (result.data ?? []) as Device[], error: null };
}

export default async function VisionDevicesPage() {
  const { rows, error } = await getDevices();
  return (
    <>
      <OperationalHero eyebrow="ESP DEVICES" title="دليل أجهزة Edge" description="مصدر واحد لحالة أجهزة الرؤية، آخر نبضة، والبيانات الصحية المصرح بعرضها. لا تُعرض مفاتيح أو رموز تسجيل الجهاز." action={<Link href="/admin/vision" className="button button-secondary"><ArrowRight size={16} />العودة إلى Vision</Link>} />
      <div className="directory-note"><Cpu size={17} /><span>سلسلة المصدر: ESP / Edge → Network → Gateway → Vision Processing. بيانات هذه الصفحة وصفية فقط حتى يتم تفعيل مسار provisioning حقيقي.</span></div>
      <Panel>
        <div className="panel-header"><div><h2>الأجهزة المسجلة</h2><p>{error ? "حالة القراءة غير متاحة" : rows.length ? `${rows.length} جهازًا في النطاق المصرح` : "لا توجد أجهزة مسجلة"}</p></div><Server size={20} color="var(--amber)" /></div>
        {error ? <div className="directory-state directory-error"><RefreshCcw size={21} /><div><strong>تعذر تحميل دليل الأجهزة</strong><span>{error}</span></div></div> : rows.length === 0 ? <div className="directory-state"><Server size={28} /><div><strong>لا توجد أجهزة Edge بعد</strong><span>لا يتم تحويل الفراغ إلى أجهزة متصلة. سجّل جهازًا بعد تجهيز هوية الجهاز وprovisioning والسياسات الخاصة به.</span></div></div> : <div className="directory-table-wrap"><table className="directory-table"><thead><tr><th>الجهاز</th><th>الموقع</th><th>الحالة</th><th>آخر نبضة</th><th>الحرارة</th><th>الشبكة</th></tr></thead><tbody>{rows.map((device) => <tr key={device.id}><td><strong>{device.name}</strong><small>{device.device_identifier} · {device.device_type}{device.firmware_version ? ` · FW ${device.firmware_version}` : ""}</small></td><td>{device.site ?? "—"}{device.zone ? <small>{device.zone}</small> : null}</td><td><StatusBadge tone={statusTone[device.status] ?? "neutral"}>{device.status}</StatusBadge></td><td>{formatTimestamp(device.heartbeat_at)}</td><td>{device.temperature_c === null ? "—" : `${device.temperature_c}°C`}</td><td>{device.network_quality ?? "—"}</td></tr>)}</tbody></table></div>}
      </Panel>
    </>
  );
}
