"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, MessageSquare, Check } from "lucide-react";
import Link from "next/link";

function MobileLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Form states
  const [phone, setPhone] = useState("");
  const [optInWhatsApp, setOptInWhatsApp] = useState(true);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Clean phone number input
    const cleanPhone = phone.trim();
    if (!/^\d{10}$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit mobile number.");
      setLoading(false);
      return;
    }

    const fullPhone = `+91${cleanPhone}`;

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setStep("OTP");
        setSuccess("Verification OTP sent successfully!");
        if (data.devOtp) {
          setDevOtp(data.devOtp);
        }
      } else {
        setError(data.error || "Failed to send verification OTP.");
      }
    } catch (err) {
      setError("Failed to connect to verification server.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const cleanPhone = phone.trim();
    const fullPhone = `+91${cleanPhone}`;

    try {
      // 1. Verify OTP with DB consent record
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: fullPhone,
          otp: otp.trim(),
          optInWhatsApp,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "OTP verification failed.");
        setLoading(false);
        return;
      }

      // 2. Sign in using NextAuth CredentialsProvider
      const nextAuthResult = await signIn("credentials", {
        redirect: false,
        phone: fullPhone,
        password: "OTP_VERIFIED",
        callbackUrl,
      });

      if (nextAuthResult?.error) {
        setError(nextAuthResult.error);
      } else {
        setSuccess("Success! Logging you in...");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("Auth session initiation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#0C0A09] text-white flex items-center justify-center p-4 sm:p-10 font-sans">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-[#1C1917] rounded-xl overflow-hidden border border-stone-800 shadow-2xl">
        {/* Left Side: Brand Marketing Panel */}
        <div className="p-8 sm:p-12 flex flex-col justify-between bg-[#141210] border-b md:border-b-0 md:border-r border-stone-850">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-wider text-brand-gold lowercase">
              vamika <span className="font-serif italic font-normal">&</span> bhargavi
            </h1>
            <p className="text-[10px] text-gray-500 font-sans uppercase tracking-widest mt-1">
              control panel & customer log
            </p>
          </div>

          <div className="my-10 space-y-4">
            <h2 className="text-xl sm:text-2xl font-serif font-light text-brand-cream/90 leading-tight">
              Login now to avail best offers!
            </h2>
            <p className="text-xs text-stone-400 font-sans tracking-wide leading-relaxed">
              Verify your mobile number to unlock exclusive pre-order deals, personalized size customisation features, and live order tracking.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[9px] text-stone-500 font-bold uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4 text-brand-gold" />
            <span>Powered by KwikPass</span>
          </div>
        </div>

        {/* Right Side: Auth Card Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-[#1C1917]">
          {error && (
            <div className="mb-6 bg-red-950/40 border border-red-900/60 text-red-200 px-4 py-3 rounded text-xs font-semibold uppercase tracking-wider text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-emerald-950/40 border border-emerald-900/60 text-emerald-200 px-4 py-3 rounded text-xs font-semibold uppercase tracking-wider text-center">
              {success}
            </div>
          )}

          {step === "PHONE" ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-400">
                  Enter Mobile Number
                </label>
                <div className="flex rounded-md border border-stone-700 bg-stone-900 overflow-hidden focus-within:border-brand-gold transition-all">
                  <span className="flex items-center bg-stone-800 px-3 text-xs text-stone-300 font-bold border-r border-stone-700">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    placeholder="Enter Mobile Number"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 bg-transparent py-3 px-3 text-xs text-white placeholder-stone-500 focus:outline-none font-semibold tracking-wider"
                    required
                  />
                </div>
              </div>

              {/* Consent Opt-In Checkbox */}
              <label className="flex items-start cursor-pointer group">
                <input
                  type="checkbox"
                  checked={optInWhatsApp}
                  onChange={(e) => setOptInWhatsApp(e.target.checked)}
                  className="rounded border-stone-700 bg-stone-900 text-brand-gold focus:ring-brand-gold h-4 w-4 mt-0.5 cursor-pointer"
                />
                <span className="ml-2.5 text-xs text-stone-400 group-hover:text-stone-300 font-medium leading-tight font-sans transition-colors">
                  Notify me with offers & updates on WhatsApp
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-gold hover:bg-opacity-95 text-stone-950 py-3.5 px-6 rounded-md text-xs font-bold uppercase tracking-widest shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Submit"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-400">
                  Verify Mobile OTP
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-Digit OTP"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-stone-900 border border-stone-700 rounded-md py-3 px-4 text-center text-sm font-bold tracking-widest text-brand-gold focus:outline-none focus:border-brand-gold placeholder:text-stone-600 placeholder:tracking-normal placeholder:font-normal"
                  required
                />
              </div>

              {devOtp && (
                <div className="p-3 bg-stone-900/60 rounded border border-dashed border-stone-850 text-center">
                  <p className="text-[10px] text-brand-gold uppercase tracking-wider font-bold">
                    Development Dev OTP: <span className="font-mono text-xs">{devOtp}</span>
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("PHONE")}
                  className="flex-1 bg-transparent border border-stone-700 hover:border-stone-500 text-stone-300 py-3 rounded-md text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-brand-gold hover:bg-opacity-95 text-stone-950 py-3 rounded-md text-xs font-bold uppercase tracking-widest shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </form>
          )}

          {/* Footer details */}
          <div className="mt-8 text-center text-[10px] text-stone-500 font-sans tracking-wide leading-relaxed">
            I accept that I have read & understood your{" "}
            <a href="#" className="underline hover:text-stone-400">Privacy Policy</a> and{" "}
            <a href="#" className="underline hover:text-stone-400">T&Cs</a>.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MobileLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center bg-[#0C0A09] text-brand-gold font-serif">
        preparing mobile validation...
      </div>
    }>
      <MobileLoginForm />
    </Suspense>
  );
}
