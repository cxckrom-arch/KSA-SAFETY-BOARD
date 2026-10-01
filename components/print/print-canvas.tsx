"use client";

import { Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { useLocale } from "@/components/providers/locale-provider";

export function PrintCanvas({ children }: { children: React.ReactNode }) {
  const { copy } = useLocale();

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: copy.printPreview, text: copy.officialRecord, url: window.location.href });
      return;
    }
    await navigator.clipboard?.writeText(window.location.href);
  };

  return (
    <div className="print-workspace">
      <div className="print-toolbar no-print">
        <div><span className="eyebrow">{copy.printPreview}</span><strong>{copy.officialRecord}</strong></div>
        <div className="toolbar-actions"><Button variant="secondary" onClick={share}><Share2 size={15} /> {copy.share}</Button><Button onClick={() => window.print()}><Printer size={15} /> {copy.print}</Button></div>
      </div>
      <article className="print-canvas" aria-label={copy.officialRecord}>{children}</article>
    </div>
  );
}
