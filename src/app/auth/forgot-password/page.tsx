"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // Step state: 1 = Email Input, 2 = OTP & New Password Input, 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Form submission and loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Dev assistance state
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Handle Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDevOtp(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(data.message || "OTP has been sent to your email.");
        if (data.devOtp) {
          setDevOtp(data.devOtp);
        }
        setStep(2);
      } else {
        setError(data.error || "Failed to send reset OTP. Please check your email.");
      }
    } catch (err: any) {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(3);
      } else {
        setError(data.error || "Reset failed. Please verify the OTP and try again.");
      }
    } catch (err: any) {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] flex-col justify-center py-12 sm:px-6 lg:px-8 bg-brand-cream">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center font-serif text-3xl md:text-4xl font-semibold tracking-wider text-brand-charcoal lowercase">
          vamika <span className="font-serif italic text-brand-gold font-normal">&</span> bhargavi
        </h2>
        <p className="mt-3 text-center text-[10px] font-sans tracking-widest text-gray-500 uppercase">
          Password Recovery Service
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-brand-cream-dark px-6 py-10 shadow-lg border border-[#F0E6D2] sm:rounded-lg sm:px-12 transition-all duration-300">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-600 text-red-800 px-4 py-3 rounded-r text-xs font-sans tracking-wide">
              {error}
            </div>
          )}

          {successMsg && step === 2 && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-600 text-green-800 px-4 py-3 rounded-r text-xs font-sans tracking-wide">
              {successMsg}
            </div>
          )}

          {/* Dev helper to display OTP code directly */}
          {devOtp && (
            <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 text-amber-900 px-4 py-3 rounded-r text-xs font-sans tracking-wide">
              <span className="font-bold">🛠️ Dev Mode Active:</span> Your simulated OTP is:{" "}
              <strong className="text-sm font-mono tracking-widest text-amber-700 bg-amber-100/50 px-2 py-0.5 rounded ml-1">
                {devOtp}
              </strong>
            </div>
          )}

          {/* Step 1: Email Request Form */}
          {step === 1 && (
            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div className="text-center mb-6">
                <p className="text-xs font-sans text-gray-600 leading-relaxed uppercase tracking-wide">
                  Enter your email address below. We will send you a 6-digit OTP code to verify your identity.
                </p>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-sans font-bold uppercase tracking-wider text-brand-charcoal">
                  Registered Email Address
                </label>
                <div className="mt-1 relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border border-[#E8DFC8] py-2.5 pl-10 pr-3 text-brand-charcoal shadow-sm placeholder:text-gray-400 focus:outline-none focus:border-brand-gold sm:text-sm bg-white font-sans transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-md bg-brand-charcoal py-3 px-4 text-xs font-sans uppercase font-bold tracking-widest text-brand-cream shadow-md hover:bg-opacity-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? "Sending OTP..." : "Request Reset OTP"}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: OTP Verification & Password Update */}
          {step === 2 && (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div className="text-center mb-4">
                <p className="text-xs font-sans text-gray-600 leading-relaxed uppercase tracking-wide">
                  Enter the code sent to <strong className="text-brand-charcoal lowercase font-bold">{email}</strong> and set your new password.
                </p>
              </div>

              <div>
                <label htmlFor="otp" className="block text-xs font-sans font-bold uppercase tracking-wider text-brand-charcoal">
                  6-Digit OTP Code
                </label>
                <div className="mt-1 relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength={6}
                    pattern="\d{6}"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="block w-full rounded-md border border-[#E8DFC8] py-2.5 pl-10 pr-3 text-brand-charcoal tracking-widest font-mono text-center font-bold text-base focus:outline-none focus:border-brand-gold bg-white transition-colors"
                    placeholder="123456"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-sans font-bold uppercase tracking-wider text-brand-charcoal">
                  New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border border-[#E8DFC8] py-2.5 pl-10 pr-3 text-brand-charcoal shadow-sm placeholder:text-gray-400 focus:outline-none focus:border-brand-gold sm:text-sm bg-white font-sans transition-colors"
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-sans font-bold uppercase tracking-wider text-brand-charcoal">
                  Confirm New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-md border border-[#E8DFC8] py-2.5 pl-10 pr-3 text-brand-charcoal shadow-sm placeholder:text-gray-400 focus:outline-none focus:border-brand-gold sm:text-sm bg-white font-sans transition-colors"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-md bg-brand-charcoal py-3 px-4 text-xs font-sans uppercase font-bold tracking-widest text-brand-cream shadow-md hover:bg-opacity-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? "Resetting Password..." : "Update Password"}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[10px] font-sans font-bold text-gray-500 uppercase tracking-widest hover:text-brand-gold transition-colors"
                >
                  ← Request a new OTP
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Success Screen */}
          {step === 3 && (
            <div className="text-center py-6 space-y-6">
              <div className="flex justify-center text-green-600 animate-bounce">
                <CheckCircle2 className="h-16 w-16" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-brand-charcoal lowercase">
                  password updated
                </h3>
                <p className="text-xs font-sans text-gray-500 uppercase tracking-widest leading-relaxed">
                  Your credentials have been successfully updated.
                </p>
              </div>
              <div className="pt-4 border-t border-[#F0E6D2]">
                <p className="text-[10px] font-sans text-gray-400 uppercase tracking-wider mb-3">
                  Return to your portal to sign in:
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Link
                    href="/auth/login"
                    className="w-full sm:w-auto px-4 py-2 border border-brand-gold text-[10px] font-sans uppercase tracking-widest font-bold text-brand-gold rounded hover:bg-brand-gold hover:text-white transition-all text-center"
                  >
                    User Login
                  </Link>
                  <Link
                    href="/seller/login"
                    className="w-full sm:w-auto px-4 py-2 border border-brand-charcoal text-[10px] font-sans uppercase tracking-widest font-bold text-brand-charcoal rounded hover:bg-brand-charcoal hover:text-white transition-all text-center"
                  >
                    Seller Login
                  </Link>
                  <Link
                    href="/admin/login"
                    className="w-full sm:w-auto px-4 py-2 border border-amber-600 text-[10px] font-sans uppercase tracking-widest font-bold text-amber-600 rounded hover:bg-amber-600 hover:text-white transition-all text-center"
                  >
                    Admin Login
                  </Link>
                </div>
              </div>
            </div>
          )}

          {step !== 3 && (
            <div className="mt-8 text-center text-xs font-sans tracking-wide border-t border-[#F0E6D2]/60 pt-6">
              <span className="text-gray-500">Remember your password? </span>
              <Link
                href="/auth/login"
                className="font-bold text-brand-gold hover:text-brand-gold-light transition-colors border-b border-brand-gold/30 hover:border-brand-gold"
              >
                Sign In Instead
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
