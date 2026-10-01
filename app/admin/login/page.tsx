"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AlertTriangle, ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/primitives";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const { copy, locale, toggleLocale } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(copy.configurationBody);
      setBusy(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(locale === "ar" ? "تعذر تسجيل الدخول. راجع بيانات الحساب أو حالة القفل." : "Sign in failed. Check the account details or lock state.");
      setBusy(false);
      return;
    }

    const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assurance && assurance.currentLevel !== assurance.nextLevel && assurance.nextLevel === "aal2") {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const factor = factors?.totp.find((item) => item.status === "verified");
      if (!factor) {
        setError(locale === "ar" ? "يتطلب الحساب MFA لكن لا يوجد عامل موثق." : "MFA is required but no verified factor is available.");
        setBusy(false);
        return;
      }
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id });
      if (challengeError) {
        setError(locale === "ar" ? "تعذر بدء تحقق MFA." : "Could not start MFA verification.");
      } else {
        setFactorId(factor.id);
        setChallengeId(challenge.id);
      }
      setBusy(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  };

  const verifyMfa = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!factorId || !challengeId) return;
    setBusy(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error: verifyError } = await supabase!.auth.mfa.verify({ factorId, challengeId, code });
    if (verifyError) {
      setError(locale === "ar" ? "رمز التحقق غير صحيح أو انتهت صلاحيته." : "The verification code is invalid or expired.");
      setBusy(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  };

  return (
    <main className="login-page">
      <aside className="login-aside">
        <Link href="/" className="brand-lockup"><span className="board-mark">KSA</span><span><strong>KSA SAFETY</strong><small>BOARD</small></span></Link>
        <div><div className="eyebrow">SECURE ADMIN ACCESS</div><h2>القرار الآمن يبدأ من هوية واضحة.</h2><p>ادخل إلى مساحة تشغيلية محكومة بالصلاحيات، قابلة للتدقيق، ومصممة لفرق السلامة.</p></div>
        <div className="login-aside-footer"><ShieldCheck size={15} /> Sessions · MFA-ready · Least privilege</div>
      </aside>
      <section className="login-form-side">
        <div className="form-card">
          <div className="form-actions"><span className="eyebrow">ADMIN / AUTH</span><button className="icon-button" onClick={toggleLocale} aria-label={copy.switchLanguage}>{locale === "ar" ? "EN" : "ع"}</button></div>
          <h1>{factorId ? "تحقق من هويتك" : copy.signIn}</h1>
          <p>{factorId ? "أدخل الرمز من تطبيق المصادقة لإكمال الجلسة." : "استخدم حساب Supabase المصرح له. لا يوجد حساب تجريبي."}</p>
          {!factorId ? <form className="form-stack" onSubmit={signIn}>
            <div className="field"><label htmlFor="email">{copy.email}</label><input id="email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
            <div className="field"><label htmlFor="password">{copy.password}</label><input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
            {!getSupabaseBrowserClient() ? <div className="form-hint"><AlertTriangle size={16} />{copy.configurationBody}</div> : null}
            {error ? <div className="form-error" role="alert">{error}</div> : null}
            <Button type="submit" disabled={busy}>{busy ? "جارٍ التحقق..." : copy.continue} <ArrowRight size={15} /></Button>
          </form> : <form className="form-stack" onSubmit={verifyMfa}>
            <div className="field"><label htmlFor="mfa-code">MFA code</label><input id="mfa-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value)} required /></div>
            {error ? <div className="form-error" role="alert">{error}</div> : null}
            <Button type="submit" disabled={busy}><KeyRound size={15} />{busy ? "جارٍ التحقق..." : "تأكيد الرمز"}</Button>
          </form>}
        </div>
      </section>
    </main>
  );
}
