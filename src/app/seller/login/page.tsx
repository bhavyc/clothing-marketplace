"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SellerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/seller"; // Default redirect to seller dashboard

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
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
        <p className="mt-3 text-center text-[10px] font-sans tracking-widest text-brand-gold uppercase font-bold">
          Seller Partner Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FAF6F0] px-6 py-10 shadow-lg border border-[#E8DFC8] sm:rounded-lg sm:px-12">
          <h3 className="mb-6 text-sm font-sans font-bold uppercase tracking-wider text-brand-charcoal border-b border-[#E8DFC8] pb-3 text-center">
            Seller Sign In
          </h3>

          {error && (
            <div className="mb-6 bg-stone-100 border-l-4 border-brand-gold text-stone-800 px-4 py-3 rounded-r text-xs font-sans tracking-wide">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-sans font-bold uppercase tracking-wider text-brand-charcoal">
                Merchant Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border border-[#E8DFC8] py-2.5 px-3 text-brand-charcoal shadow-sm placeholder:text-gray-400 focus:outline-none focus:border-brand-gold sm:text-sm bg-white font-sans transition-colors"
                  placeholder="seller@boutique.com"
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
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-[#E8DFC8] py-2.5 px-3 text-brand-charcoal shadow-sm placeholder:text-gray-400 focus:outline-none focus:border-brand-gold sm:text-sm bg-white font-sans transition-colors"
                  placeholder="Enter merchant password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-brand-charcoal py-3 px-4 text-xs font-sans uppercase font-bold tracking-widest text-brand-cream shadow-md hover:bg-opacity-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Verifying Portal..." : "Enter Portal"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-xs font-sans tracking-wide">
            <span className="text-gray-500">Want to sell with us? </span>
            <Link
              href="/seller/register"
              className="font-bold text-brand-gold hover:text-brand-gold-light transition-colors border-b border-brand-gold/30 hover:border-brand-gold"
            >
              Apply as Seller
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SellerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center bg-brand-cream">
          <p className="font-serif text-lg text-brand-gold tracking-widest lowercase">
            loading seller portal...
          </p>
        </div>
      }
    >
      <SellerLoginForm />
    </Suspense>
  );
}
