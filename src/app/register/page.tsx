"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FiUser, FiMail, FiPhone, FiLock } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import "../auth.css";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto-login after signup
      const loginRes = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: true,
        callbackUrl: "/profile",
      });
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link href="/">
            <img src="/logo-nizo.png" alt="NIZO Logo" style={{ height: '70px', width: 'auto', marginBottom: '0.5rem' }} />
          </Link>
          <h1>CREATE ACCOUNT</h1>
          <p>Join NIZO and start your shopping journey</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group">
            <label className="label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <FiUser style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type="text"
                className="input"
                style={{ paddingLeft: '3rem' }}
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type="email"
                className="input"
                style={{ paddingLeft: '3rem' }}
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <FiPhone style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type="tel"
                className="input"
                style={{ paddingLeft: '3rem' }}
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                placeholder="10-digit mobile number"
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type="password"
                className="input"
                style={{ paddingLeft: '3rem' }}
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${loading ? "btn-disabled" : ""}`}
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? "Creating account..." : "SIGN UP"}
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
          Already have an account? <Link href="/login" style={{ fontWeight: '600', color: 'var(--foreground)' }}>Login</Link>
        </div>
      </div>
    </div>
  );
}
