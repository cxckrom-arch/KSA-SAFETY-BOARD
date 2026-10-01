import type { Metadata } from "next";
import "./globals.css";
import "./accent.css";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "KSA SAFETY BOARD",
  description: "Operational safety command system",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <LocaleProvider>
            <QueryProvider>{children}</QueryProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
