import { ArrowUpLeft, Database, FileSearch, LockKeyhole, Route, ShieldCheck } from "lucide-react";
import { OperationalHero, Panel, StatusBadge } from "@/components/ui/primitives";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getSidebarRoutes } from "@/lib/route-registry";

export default function AdminDashboardPage() {
  const connected = isSupabaseConfigured();
  const routes = getSidebarRoutes();

  return (
    <>
      <OperationalHero eyebrow="COMMAND CENTER" title="اعرف ما يحتاج قرارًا الآن" description="الأساس التشغيلي جاهز. ستظهر البيانات الحية هنا بعد ربط المصدر والصلاحيات، دون مؤشرات تجريبية." />
      <div className="dashboard-grid">
        <div className="dashboard-stack">
          <Panel>
            <div className="panel-header"><div><h2>حالة المنصة</h2><p>مؤشرات اتصال حقيقية فقط</p></div><StatusBadge tone={connected ? "success" : "warning"}>{connected ? "Supabase configured" : "Configuration required"}</StatusBadge></div>
            <div className="system-grid">
              <div className="system-item"><Database size={18} /><strong>Auth & Database</strong><span>{connected ? "Environment detected" : "Waiting for project"}</span></div>
              <div className="system-item"><LockKeyhole size={18} /><strong>Server authorization</strong><span>RLS foundation defined</span></div>
              <div className="system-item"><Route size={18} /><strong>Route traceability</strong><span>{routes.length} shell routes registered</span></div>
            </div>
          </Panel>
          <Panel>
            <div className="panel-header"><div><h2>ما يحتاج متابعة</h2><p>صندوق العمل المركزي سيتغذى من الوحدات التشغيلية</p></div><FileSearch size={20} color="var(--ink-faint)" /></div>
            <div className="state-block empty-state"><ShieldCheck size={24} /><div><h3>لا توجد سجلات تشغيلية متصلة</h3><p>أكمل ربط Supabase ثم فعّل أول وحدة مصدر. لن يتم عرض حالات أو أرقام غير مستندة إلى سجل فعلي.</p></div></div>
          </Panel>
        </div>
        <Panel>
          <div className="panel-header"><div><h2>المسارات الأساسية</h2><p>من التنقل إلى المورد والصلاحية</p></div></div>
          <div className="signal-list">{routes.map((route) => <div className="signal-row" key={route.path}><div className="signal-copy"><strong>{route.title}</strong><span>{route.permission}</span></div><ArrowUpLeft size={16} className="signal-arrow" /></div>)}</div>
        </Panel>
      </div>
    </>
  );
}
