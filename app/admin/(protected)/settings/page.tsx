import { Check, Database, Languages, Moon, ShieldCheck } from "lucide-react";
import { OperationalHero, Panel, StatusBadge } from "@/components/ui/primitives";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export default function SettingsPage() {
  const configured = isSupabaseConfigured();
  return (
    <>
      <OperationalHero eyebrow="SETTINGS" title="تهيئة مساحة العمل" description="إعدادات الأساس التي تؤثر على الهوية، اللغة، المظهر، ومصدر البيانات." />
      <div className="dashboard-grid">
        <Panel>
          <div className="panel-header"><div><h2>هوية المجلس</h2><p>هوية ثابتة في التطبيق والمطبوعات</p></div><ShieldCheck size={20} color="var(--amber)" /></div>
          <div className="signal-list">
            <div className="signal-row"><div className="signal-copy"><strong>KSA SAFETY BOARD</strong><span>الاسم التشغيلي الثابت</span></div><Check size={16} color="var(--success)" /></div>
            <div className="signal-row"><div className="signal-copy"><strong>Safety Amber</strong><span>#F0A51A · لون الإشارة</span></div><span className="status-badge status-warning">Brand</span></div>
            <div className="signal-row"><div className="signal-copy"><strong>Print canvas</strong><span>White · A4 default</span></div><span className="status-badge status-success">Ready</span></div>
          </div>
        </Panel>
        <Panel>
          <div className="panel-header"><div><h2>بيئة التشغيل</h2><p>حالة قابلة للتحقق وليست قيمة تجريبية</p></div><Database size={20} color="var(--ink-faint)" /></div>
          <div className="signal-list">
            <div className="signal-row"><div className="signal-copy"><strong>Supabase</strong><span>Authentication + PostgreSQL + RLS</span></div><StatusBadge tone={configured ? "success" : "warning"}>{configured ? "Configured" : "Not connected"}</StatusBadge></div>
            <div className="signal-row"><div className="signal-copy"><strong>Language</strong><span>Arabic RTL · English LTR</span></div><Languages size={16} color="var(--success)" /></div>
            <div className="signal-row"><div className="signal-copy"><strong>Theme</strong><span>Light and dark application modes</span></div><Moon size={16} color="var(--info)" /></div>
          </div>
        </Panel>
      </div>
    </>
  );
}
