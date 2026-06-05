"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TrendingUp, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const friendlyError = (err: { code?: string; message: string }) => {
    switch (err.code) {
      case "invalid_credentials": return "Email ou mot de passe incorrect.";
      case "email_not_confirmed": return "Votre email n'est pas encore confirmé. Vérifiez votre boîte mail (pensez aux spams).";
      case "email_address_invalid": return "Adresse email invalide ou refusée par le serveur.";
      case "user_already_exists":
      case "email_exists": return "Un compte existe déjà avec cet email. Connectez-vous.";
      case "weak_password": return "Mot de passe trop faible (6 caractères minimum).";
      case "over_email_send_rate_limit":
      case "over_request_rate_limit": return "Trop de tentatives. Réessayez dans quelques minutes.";
      default: return err.message || "Une erreur est survenue.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setNeedsConfirm(false);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) setError(friendlyError(error));
      else setMessage("Vérifiez votre email pour confirmer votre compte.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(friendlyError(error));
        setNeedsConfirm(error.code === "email_not_confirmed");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    }
    setLoading(false);
  };

  const resendConfirmation = async () => {
    setError("");
    setMessage("");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) setError(friendlyError(error));
    else setMessage("Email de confirmation renvoyé. Vérifiez votre boîte mail.");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-primary shadow-primary mb-4">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            PayTrack
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Suivez l'évolution de vos revenus</p>
        </div>

        <div className="bg-gradient-card border border-border/50 rounded-2xl p-8 shadow-card">
          <div className="flex bg-muted/30 rounded-xl p-1 mb-6">
            {(["signin", "signup"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === m ? "bg-primary text-primary-foreground shadow-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {m === "signin" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Nom complet" value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground" />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type={showPassword ? "text" : "password"} placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-danger text-sm bg-danger/10 px-3 py-2 rounded-lg">{error}</p>}
            {needsConfirm && (
              <button type="button" onClick={resendConfirmation}
                className="w-full text-sm text-primary hover:underline">
                Renvoyer l'email de confirmation
              </button>
            )}
            {message && <p className="text-success text-sm bg-success/10 px-3 py-2 rounded-lg">{message}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-primary text-white font-medium py-3 rounded-xl shadow-primary hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? "Chargement..." : mode === "signin" ? "Se connecter" : "Créer un compte"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}