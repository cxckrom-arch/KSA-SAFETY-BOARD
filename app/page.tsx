import Link from "next/link";
import { ArrowUpLeft, ClipboardCheck, FileCheck2, SearchCheck, ShieldCheck } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/primitives";

export default function HomePage() {
  return (
    <PublicShell>
      <main className="public-main">
        <section className="public-hero">
          <div>
            <div className="eyebrow">SAFETY OPERATIONS · KSA</div>
            <h1>دليل واضح.<br /><span className="accent-text">إجراء مسؤول.</span></h1>
            <p>منصة قيادة سلامة تشغيلية تجمع الدليل، القرار، والإجراء القابل للتدقيق في مساحة واحدة مهيأة للفرق الصناعية.</p>
            <div className="public-hero-actions">
              <Link href="/admin/login"><Button>دخول لوحة الإدارة <ArrowUpLeft size={16} /></Button></Link>
              <Link href="/admin/print"><Button variant="secondary">استعراض نظام الطباعة</Button></Link>
            </div>
          </div>
          <div className="public-note">
            <h2>الأساس قبل الوحدات</h2>
            <div className="public-note-row"><ShieldCheck size={19} /><div><strong>هوية وصلاحيات</strong><span>حسابات حقيقية وحد أدنى من الامتيازات.</span></div></div>
            <div className="public-note-row"><ClipboardCheck size={19} /><div><strong>مسارات قابلة للتتبع</strong><span>كل route مرتبط بصفحة ومورد وصلاحية.</span></div></div>
            <div className="public-note-row"><FileCheck2 size={19} /><div><strong>مخرجات رسمية</strong><span>قوالب بيضاء للطباعة والمشاركة.</span></div></div>
            <div className="public-note-row"><SearchCheck size={19} /><div><strong>قرار سريع</strong><span>تنقل وبحث يقدمان ما يحتاج انتباهًا.</span></div></div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
