import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Input from "../components/Input";
import Button from "../components/Button";

const API = "https://bank-4-yt2f.onrender.com/forgot-password";

// ── Step indicators ───────────────────────────────────────────────────────────
const steps = ["Request OTP", "Verify OTP", "New Password"];

const StepBar = ({ current }) => (
  <div className="flex items-center justify-center mb-8 gap-0">
    {steps.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <div key={i} className="flex items-center">
          {/* circle */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                ${done ? "bg-green-500 text-white" : active ? "bg-blue-600 text-white ring-4 ring-blue-200" : "bg-gray-200 text-gray-500"}`}
            >
              {done ? "✓" : i + 1}
            </div>
            <span
              className={`mt-1 text-xs font-medium whitespace-nowrap transition-colors duration-300
                ${active ? "text-blue-600" : done ? "text-green-600" : "text-gray-400"}`}
            >
              {label}
            </span>
          </div>
          {/* connector */}
          {i < steps.length - 1 && (
            <div
              className={`w-16 h-1 mx-1 mb-4 rounded transition-colors duration-300
                ${done ? "bg-green-400" : "bg-gray-200"}`}
            />
          )}
        </div>
      );
    })}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const ForgotPassword = () => {
  const [step, setStep] = useState(0); // 0 = email, 1 = otp, 2 = new password

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // ── Step 1: Request OTP ────────────────────────────────────────────────────
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Please enter your email.");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/request-otp`, { email });
      toast.success(res.data.message || "OTP sent! Check your inbox.");
      setOtpSent(true);
      setStep(1);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return toast.error("Please enter the OTP.");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/verify-otp`, { email, otp });
      toast.success(res.data.message || "OTP verified!");
      setStep(2);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ─────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6)
      return toast.error("Password must be at least 6 characters.");
    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match.");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/reset-password`, {
        email,
        otp,
        new_password: newPassword,
      });
      toast.success(res.data.message || "Password reset successfully!");
      setTimeout(() => (window.location.href = "/login"), 1800);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/request-otp`, { email });
      setOtp("");
      toast.info("A new OTP has been sent to your email.");
    } catch {
      toast.error("Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-3">
              <svg
                className="w-7 h-7 text-blue-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
            <p className="text-sm text-gray-500 mt-1">
              {step === 0 && "Enter your email to receive a one-time password."}
              {step === 1 && "Enter the 6-digit OTP sent to your email."}
              {step === 2 && "Choose a new secure password."}
            </p>
          </div>

          {/* Step bar */}
          <StepBar current={step} />

          {/* ── Step 0: Email ── */}
          {step === 0 && (
            <form onSubmit={handleRequestOtp} noValidate>
              <Input
                id="fp-email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" loading={loading}>
                {loading ? "Sending OTP…" : "Send OTP"}
              </Button>
            </form>
          )}

          {/* ── Step 1: OTP ── */}
          {step === 1 && (
            <form onSubmit={handleVerifyOtp} noValidate>
              <p className="text-sm text-gray-500 mb-3">
                OTP sent to <span className="font-semibold text-gray-700">{email}</span>
              </p>
              <Input
                id="fp-otp"
                name="otp"
                type="text"
                label="One-Time Password (OTP)"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                required
              />
              <Button type="submit" loading={loading}>
                {loading ? "Verifying…" : "Verify OTP"}
              </Button>

              {/* Resend + Back */}
              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="text-gray-500 hover:text-gray-700 underline"
                >
                  ← Change email
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* ── Step 2: New Password ── */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} noValidate>
              <Input
                id="fp-new-password"
                name="new_password"
                type="password"
                label="New Password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Input
                id="fp-confirm-password"
                name="confirm_password"
                type="password"
                label="Confirm Password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button type="submit" loading={loading}>
                {loading ? "Resetting…" : "Reset Password"}
              </Button>
            </form>
          )}

          {/* Back to login */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Remembered it?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
