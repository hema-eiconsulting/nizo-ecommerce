"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import "../auth.css";

type Step = "phone" | "otp" | "name";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [step, setStep] = useState<Step>("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  // ── Step 1: Send OTP ──────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      setIsNewUser(data.isNewUser);
      setStep("otp");
      setResendTimer(30);
      // Focus first OTP box
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handlers ────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    if (isNewUser) {
      // New user → collect name first
      setStep("name");
      setError("");
      return;
    }

    // Returning user → login directly
    await doSignIn(otpValue, "");
  };

  // ── Step 3: Collect name & sign up ───────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    await doSignIn(otp.join(""), name.trim());
  };

  const doSignIn = async (otpValue: string, userName: string) => {
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        phone,
        otp: otpValue,
        name: userName,
        isSignup: isNewUser.toString(),
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        // On bad OTP, go back to OTP step
        if (result.error.includes("OTP") || result.error.includes("otp")) {
          setStep("otp");
          setOtp(["", "", "", "", "", ""]);
          setTimeout(() => otpRefs.current[0]?.focus(), 100);
        }
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-header">
          <img src="/logo-nizo.png" alt="NIZO Logo" style={{ height: '120px', width: 'auto', marginBottom: '1rem' }} />
          <p>
            {step === "phone" && "Login or sign up with your phone number"}
            {step === "otp" && `Enter the OTP sent to +91 ${phone}`}
            {step === "name" && "Welcome! Tell us your name"}
          </p>
        </div>

        {/* Step indicators */}
        <div className="otp-steps">
          {["phone", "otp", "name"].map((s, i) => (
            <div key={s} className="otp-step-wrap">
              <div className={`otp-step-dot ${step === s ? "active" : (["phone","otp","name"].indexOf(step) > i ? "done" : "")}`}>
                {["phone","otp","name"].indexOf(step) > i ? "✓" : i + 1}
              </div>
              {i < 2 && <div className="otp-step-line" />}
            </div>
          ))}
        </div>

        {error && <div className="auth-error">{error}</div>}

        {/* ── Phone Step ── */}
        {step === "phone" && (
          <form onSubmit={handleSendOtp} className="auth-form">
            <div>
              <label className="label">Mobile Number</label>
              <div className="phone-input-wrap">
                <span className="phone-prefix">🇮🇳 +91</span>
                <input
                  type="tel"
                  className="input phone-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                  autoFocus
                />
              </div>
            </div>
            <button
              type="submit"
              className={`btn btn-primary ${loading ? "btn-disabled" : ""}`}
              disabled={loading}
            >
              {loading ? "Sending OTP…" : "Send OTP"}
            </button>
          </form>
        )}

        {/* ── OTP Step ── */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div>
              <label className="label">Enter 6-digit OTP</label>
              <div className="otp-boxes" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`otp-box ${digit ? "otp-box-filled" : ""}`}
                  />
                ))}
              </div>
              <p className="otp-hint">
                {isNewUser
                  ? "New number — creating your account"
                  : "Welcome back! Logging you in"}
              </p>
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${loading ? "btn-disabled" : ""}`}
              disabled={loading || otp.join("").length < 6}
            >
              {loading ? "Verifying…" : "Verify OTP"}
            </button>

            <div className="otp-resend">
              {resendTimer > 0 ? (
                <span>Resend OTP in <b>{resendTimer}s</b></span>
              ) : (
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => {
                    setStep("phone");
                    setOtp(["", "", "", "", "", ""]);
                  }}
                >
                  ← Change number or resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        {/* ── Name Step (new users only) ── */}
        {step === "name" && (
          <form onSubmit={handleSignup} className="auth-form">
            <div>
              <p className="new-user-note">
                We couldn't find an account for <b>+91 {phone}</b>. You're almost there — just enter your name!
              </p>
              <label className="label">Full Name</label>
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              className={`btn btn-primary ${loading ? "btn-disabled" : ""}`}
              disabled={loading}
            >
              {loading ? "Creating Account…" : "Create Account & Continue"}
            </button>
            <button
              type="button"
              className="link-btn"
              onClick={() => { setStep("phone"); setOtp(["","","","","",""]); }}
            >
              ← Start over
            </button>
          </form>
        )}

        <div className="auth-footer">
          By continuing, you agree to NIZO's Terms of Service.
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
