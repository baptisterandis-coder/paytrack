"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { TrendingUp, Lock, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [linkError, setLinkError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    const expired = "Ce lien a expiré ou a déjà été utilisé. Redemandez un email depuis la page de connexion.";

    // Lien au format "hash" (#access_token=...) : la session est récupérée automatiquement
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active || !session) return;
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
        setLinkError("");
        setChecking(false);
      }
    });

    const init = async () => {
      const url = new URL(window.location.href);
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
      if (url.searchParams.get("error_description") || hashParams.get("error_description")) {
        setLinkError(expired);
        setChecking(false);
        return;
      }
      // Lien au format "token_hash" (?token_hash=...&type=recovery) : fonctionne depuis n'importe quel appareil
      const tokenHash = url.searchParams.get("token_hash");
      const otpType = url.searchParams.get("type");
      if (tokenHash && otpType) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: otpType as "recovery" | "email" | "signup" | "invite" | "magiclink" | "email_change",
        });
        if (!active) return;
        if (error) {
          setLinkError(expired);
          setChecking(false);
          return;
        }
        window.history.replaceState(null, "", "/auth/reset");
      }
      // Lien au format "code" (?code=...) : on l'échange contre une session
      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!active) return;
        if (error) {
          setLinkError(expired);
          setChecking(false);
          return;
        }
        window.history.replaceState(null, "", "/auth/reset");
      }
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (data.session) setReady(true);
      else if (!hashParams.get("access_token")) setLinkError(expired);
      setChecking(false);
    };
    init();

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Mot de passe trop faible (6 caractères minimum).");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message || "Une erreur est survenue.");
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  };

  const inputClass =
    "w-full bg-muted/30 border border-border rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="h-12 mx-auto" />
          <p className="text-muted-foreground mt-1 text-sm">Choisissez un nouveau mot de passe</p>
        </div>

        <div className="bg-gradient-card border border-border/50 rounded-2xl p-8 shadow-card">
          {checking && !ready ? (
            <p className="text-sm text-muted-foreground text-center">Vérification du lien...</p>
          ) : linkError && !ready ? (
            <div className="space-y-4 text-center">
              <p className="text-danger text-sm bg-danger/10 px-3 py-2 rounded-lg">{linkError}</p>
              <button onClick={() => router.push("/auth")} className="text-sm text-primary hover:underline">
                Retour à la connexion
              </button>
            </div>
          ) : done ? (
            <p className="text-success text-sm bg-success/10 px-3 py-2 rounded-lg text-center">
              Mot de passe mis à jour. Redirection vers votre tableau de bord...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showPassword ? "text" : "password"} placeholder="Nouveau mot de passe" value={password}
                  onChange={e => setPassword(e.target.value)} required autoComplete="new-password" className={inputClass} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showPassword ? "text" : "password"} placeholder="Confirmer le mot de passe" value={confirm}
                  onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" className={inputClass} />
              </div>
              {error && <p className="text-danger text-sm bg-danger/10 px-3 py-2 rounded-lg">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-primary text-white font-medium py-3 rounded-xl shadow-primary hover:opacity-90 transition-opacity disabled:opacity-50">
                {loading ? "Enregistrement..." : "Enregistrer le nouveau mot de passe"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
