import { Bell, Filter } from "lucide-react";
import { OperationalHero, Panel, EmptyState, Button } from "@/components/ui/primitives";

export default function NotificationsPage() {
  return (
    <>
      <OperationalHero eyebrow="NOTIFICATIONS" title="الإشعارات" description="التنبيهات والإسنادات الخاصة بك، مع سجل واضح لما يحتاج إجراءً." action={<Button variant="secondary"><Filter size={15} /> تصفية</Button>} />
      <Panel>
        <EmptyState title="لا توجد إشعارات جديدة" description="سيظهر هنا ما يتم إسناده إليك أو ما يتطلب مراجعة بعد اتصال مصدر الإشعارات الحي." action={<div className="success-mark"><Bell size={15} /> صندوق نظيف</div>} />
      </Panel>
    </>
  );
}
