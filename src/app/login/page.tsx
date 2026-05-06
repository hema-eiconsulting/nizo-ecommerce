"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import "../auth.css";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signIn("google", { callbackUrl });
    } catch (err: any) {
      setError("Google login failed to initialize: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link href="/">
            <img src="/logo-nizo.png" alt="NIZO Logo" style={{ height: '70px', width: 'auto', marginBottom: '0.5rem' }} />
          </Link>
          <h1>WELCOME BACK</h1>
          <p>Login to your account to continue shopping</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleEmailLogin} className="auth-form">
          <div className="form-group">
            <label className="label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type="email"
                className="input"
                style={{ paddingLeft: '3rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type={showPassword ? "text" : "password"}
                className="input"
                style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1rem', position: 'relative', zIndex: 10 }}>
            <Link 
              href="/forgot-password" 
              style={{ fontSize: '0.85rem', color: 'var(--muted)', textDecoration: 'underline', padding: '0.5rem 0', display: 'inline-block' }}
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${loading ? "btn-disabled" : ""}`}
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "LOGIN"}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="btn btn-outline"
          style={{ width: '100%', display: 'flex', gap: '1rem', alignItems: 'center' }}
        >
          <FcGoogle size={20} />
          CONTINUE WITH GOOGLE
        </button>

        <div className="auth-footer">
          Don't have an account? <Link href="/register" style={{ fontWeight: '600', color: 'var(--foreground)' }}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div>Loading…</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
