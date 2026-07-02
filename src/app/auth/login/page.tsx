"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, MessageSquare, Check, Mail, Phone } from "lucide-react";
import Link from "next/link";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Toggle state: default is "PHONE" to encourage OTP & consent capture
  const [loginMethod, setLoginMethod] = useState<"EMAIL" | "PHONE">("PHONE");

  // Email login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Phone login states
  const [phone, setPhone] = useState("");
  const [optInWhatsApp, setOptInWhatsApp] = useState(true);
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState<"PHONE" | "OTP">("PHONE");
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Common UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle Email Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess("Success! Logging you in...");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Send OTP (Phone)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

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
        setOtpStep("OTP");
        setSuccess("Verification OTP sent to WhatsApp!");
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

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const cleanPhone = phone.trim();
    const fullPhone = `+91${cleanPhone}`;

    try {
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
    <div className="flex min-h-[85vh] flex-col justify-center py-12 sm:px-6 lg:px-8 bg-brand-cream">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center font-serif text-3xl md:text-4xl font-semibold tracking-wider text-brand-charcoal lowercase">
          vamika <span className="font-serif italic text-brand-gold font-normal">&</span> bhargavi
        </h2>
        <p className="mt-3 text-center text-[10px] font-sans tracking-widest text-gray-500 uppercase">
          Welcome back to the label
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-brand-cream-dark px-6 py-10 shadow-lg border border-[#F0E6D2] sm:rounded-lg sm:px-12">
          
          {/* Login Method Toggle Tab */}
          <div className="flex justify-center mb-8 border-b border-[#E8DFC8]">
            <button
              type="button"
              onClick={() => {
                setLoginMethod("PHONE");
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 pb-3 text-center text-xs font-sans font-bold uppercase tracking-wider transition-all border-b-2 ${
                loginMethod === "PHONE"
                  ? "border-brand-gold text-brand-charcoal"
                  : "border-transparent text-gray-400 hover:text-brand-charcoal"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                Phone OTP
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod("EMAIL");
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 pb-3 text-center text-xs font-sans font-bold uppercase tracking-wider transition-all border-b-2 ${
                loginMethod === "EMAIL"
                  ? "border-brand-gold text-brand-charcoal"
                  : "border-transparent text-gray-400 hover:text-brand-charcoal"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Email / Pass
              </span>
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-stone-100 border-l-4 border-red-600 text-stone-800 px-4 py-3 rounded-r text-xs font-sans tracking-wide">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-stone-100 border-l-4 border-emerald-600 text-stone-800 px-4 py-3 rounded-r text-xs font-sans tracking-wide">
              {success}
            </div>
          )}

          {/* METHOD 1: PHONE (KREO OTP LOGINS) */}
          {loginMethod === "PHONE" && (
            <>
              {otpStep === "PHONE" ? (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div>
                    <label className="block text-xs font-sans font-bold uppercase tracking-wider text-brand-charcoal">
                      Mobile Number
                    </label>
                    <div className="mt-1.5 flex rounded-md border border-[#E8DFC8] bg-white overflow-hidden shadow-xs focus-within:border-brand-gold transition-colors">
                      <span className="flex items-center bg-stone-50 px-3 text-xs text-brand-charcoal font-bold border-r border-[#E8DFC8]">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        placeholder="Enter 10-Digit Mobile"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        className="flex-1 bg-transparent py-2.5 px-3 text-sm text-brand-charcoal placeholder-gray-400 focus:outline-none font-sans font-semibold tracking-wider"
                        required
                      />
                    </div>
                  </div>

                  {/* Consent Checkbox */}
                  <label className="flex items-start cursor-pointer group mt-2">
                    <input
                      type="checkbox"
                      checked={optInWhatsApp}
                      onChange={(e) => setOptInWhatsApp(e.target.checked)}
                      className="rounded border-[#E8DFC8] text-brand-gold focus:ring-brand-gold h-4 w-4 mt-0.5 cursor-pointer"
                    />
                    <span className="ml-2 text-xs text-stone-600 group-hover:text-brand-charcoal font-sans transition-colors leading-tight">
                      Notify me with offers & updates on WhatsApp
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-md bg-brand-charcoal py-3 px-4 text-xs font-sans uppercase font-bold tracking-widest text-brand-cream shadow-md hover:bg-opacity-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? "Sending OTP..." : "Get OTP via WhatsApp"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <label className="block text-xs font-sans font-bold uppercase tracking-wider text-brand-charcoal text-center mb-2">
                      Enter verification code sent to WhatsApp
                    </label>
                    <input
                      type="text"
                      placeholder="Enter 6-Digit OTP"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-md border border-[#E8DFC8] py-2.5 px-4 text-center text-sm font-bold tracking-widest text-brand-gold bg-white focus:outline-none focus:border-brand-gold placeholder:tracking-normal placeholder:font-normal"
                      required
                    />
                  </div>

                  {devOtp && (
                    <div className="p-3 bg-[#FAF6F0] rounded border border-dashed border-[#E8DFC8] text-center">
                      <p className="text-[10px] text-brand-gold uppercase tracking-wider font-bold">
                        Development Dev OTP: <span className="font-mono text-xs">{devOtp}</span>
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setOtpStep("PHONE")}
                      className="flex-1 border border-[#E8DFC8] bg-white text-stone-700 py-3 rounded-md text-xs font-sans uppercase font-bold tracking-widest transition-all hover:bg-stone-50 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-brand-charcoal text-brand-cream py-3 rounded-md text-xs font-sans uppercase font-bold tracking-widest transition-all hover:bg-opacity-95 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* METHOD 2: EMAIL / PASSWORD */}
          {loginMethod === "EMAIL" && (
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
              <div>
                <label htmlFor="email" className="block text-xs font-sans font-bold uppercase tracking-wider text-brand-charcoal">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border border-[#E8DFC8] py-2.5 px-3 text-brand-charcoal shadow-sm placeholder:text-gray-400 focus:outline-none focus:border-brand-gold sm:text-sm bg-white font-sans transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-sans font-bold uppercase tracking-wider text-brand-charcoal">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[10px] font-sans text-brand-gold hover:underline font-bold uppercase tracking-wider"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="mt-1">
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border border-[#E8DFC8] py-2.5 px-3 text-brand-charcoal shadow-sm placeholder:text-gray-400 focus:outline-none focus:border-brand-gold sm:text-sm bg-white font-sans transition-colors"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-md bg-brand-charcoal py-3 px-4 text-xs font-sans uppercase font-bold tracking-widest text-brand-cream shadow-md hover:bg-opacity-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? "Verifying..." : "Sign In"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center text-[10px] text-stone-500 font-sans tracking-wide leading-relaxed">
            <span className="text-gray-500">New to Vamika & Bhargavi? </span>
            <span className="font-bold text-brand-gold uppercase tracking-wider block mt-1">
              Just enter your mobile number above to register instantly!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center bg-brand-cream">
          <p className="font-serif text-lg text-brand-gold tracking-widest lowercase">
            loading...
          </p>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
