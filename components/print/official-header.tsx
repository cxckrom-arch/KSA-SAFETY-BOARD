"use client";

import { formatDate } from "@/lib/utils";
import { useLocale } from "@/components/providers/locale-provider";

export function OfficialHeader({ reportNumber = "KSB-FOUNDATION-001" }: { reportNumber?: string }) {
  const { copy, locale } = useLocale();
  return (
    <header className="official-header">
      <div className="official-brand"><span className="board-mark board-mark-print">KSA</span><div><strong>KSA SAFETY BOARD</strong><small>{copy.boardSubline}</small></div></div>
      <div className="official-meta"><div><span>{copy.reportNumber}</span><strong>{reportNumber}</strong></div><div><span>{copy.generatedAt}</span><strong>{formatDate(new Date(), locale)}</strong></div></div>
    </header>
  );
}
