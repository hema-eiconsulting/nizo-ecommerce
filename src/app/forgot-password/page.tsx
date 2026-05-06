"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import "../auth.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [data, setData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (data.newPassword !== data.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email, newPassword: data.newPassword }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || "Failed to reset password");
      } else {
        setSuccess("Password updated successfully! You can now login with your new password.");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link href="/">
            <img src="/logo-nizo.png" alt="NIZO Logo" style={{ height: '60px', width: 'auto', marginBottom: '0.5rem' }} />
          </Link>
          <h1>RESET PASSWORD</h1>
          <p>Enter your email and a new password</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div style={{ padding: '1rem', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>{success}</div>}

        <form onSubmit={onSubmit} className="auth-form">
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
            <label className="label">New Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type={showPassword ? "text" : "password"}
                className="input"
                style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                value={data.newPassword}
                onChange={(e) => setData({ ...data, newPassword: e.target.value })}
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

          <div className="form-group">
            <label className="label">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="input"
                style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                value={data.confirmPassword}
                onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${loading ? "btn-disabled" : ""}`}
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading || !!success}
          >
            {loading ? "Updating..." : "RESET PASSWORD"}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '2rem' }}>
          <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: 'var(--foreground)' }}>
            <FiArrowLeft /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
