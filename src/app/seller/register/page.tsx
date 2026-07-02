"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SellerRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopDescription, setShopDescription] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role: "SELLER",
        shopName,
        shopDescription,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit application. Please try again.");
      } else {
        setSuccess("Seller partner application registered successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/seller/login");
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[90vh] flex-col justify-center py-12 sm:px-6 lg:px-8 bg-brand-cream">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center font-serif text-3xl md:text-4xl font-semibold tracking-wider text-brand-charcoal lowercase">
          vamika <span className="font-serif italic text-brand-gold font-normal">&</span> bhargavi
        </h2>
        <p className="mt-3 text-center text-[10px] font-sans tracking-widest text-brand-gold uppercase font-bold">
          Partner Registration
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FAF6F0] px-6 py-10 shadow-lg border border-[#E8DFC8] sm:rounded-lg sm:px-12">
          <h3 className="mb-6 text-sm font-sans font-bold uppercase tracking-wider text-brand-charcoal border-b border-[#E8DFC8] pb-3 text-center">
            Register Seller Shop
          </h3>

          {error && (
            <div className="mb-6 bg-stone-100 border-l-4 border-brand-gold text-stone-800 px-4 py-3 rounded-r text-xs font-sans tracking-wide">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-emerald-600 text-emerald-800 px-4 py-3 rounded-r text-xs font-sans tracking-wide">
              {success}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-xs font-sans font-bold uppercase tracking-wider text-brand-charcoal">
                Merchant Owner Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-md border border-[#E8DFC8] py-2.5 px-3 text-brand-charcoal shadow-sm placeholder:text-gray-400 focus:outline-none focus:border-brand-gold sm:text-sm bg-white font-sans transition-colors"
                  placeholder="Enter owner name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-sans font-bold uppercase tracking-wider text-brand-charcoal">
                Merchant Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border border-[#E8DFC8] py-2.5 px-3 text-brand-charcoal shadow-sm placeholder:text-gray-400 focus:outline-none focus:border-brand-gold sm:text-sm bg-white font-sans transition-colors"
                  placeholder="seller@boutique.com"
                />
              </div>
            </div>

             <div>
              <label htmlFor="shopName" className="block text-xs font-sans font-bold uppercase tracking-wider text-brand-charcoal">
                Designer Label/Shop Name
              </label>
              <div className="mt-1">
                <input
                  id="shopName"
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="block w-full rounded-md border border-[#E8DFC8] py-2.5 px-3 text-brand-charcoal shadow-sm placeholder:text-gray-400 focus:outline-none focus:border-brand-gold sm:text-sm bg-white font-sans transition-colors"
                  placeholder="e.g. Elegance Couture"
                />
              </div>
            </div>

            <div>
              <label htmlFor="shopDescription" className="block text-xs font-sans font-bold uppercase tracking-wider text-brand-charcoal">
                Designer/Shop Description
              </label>
              <div className="mt-1">
                <textarea
                  id="shopDescription"
                  rows={3}
                  value={shopDescription}
                  onChange={(e) => setShopDescription(e.target.value)}
                  className="block w-full rounded-md border border-[#E8DFC8] py-2.5 px-3 text-brand-charcoal shadow-sm placeholder:text-gray-400 focus:outline-none focus:border-brand-gold sm:text-sm bg-white font-sans transition-colors"
                  placeholder="Describe your design aesthetics, fabric types, and items you specialize in..."
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-sans font-bold uppercase tracking-wider text-brand-charcoal">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-[#E8DFC8] py-2.5 px-3 text-brand-charcoal shadow-sm placeholder:text-gray-400 focus:outline-none focus:border-brand-gold sm:text-sm bg-white font-sans transition-colors"
                  placeholder="Create password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-sans font-bold uppercase tracking-wider text-brand-charcoal">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-md border border-[#E8DFC8] py-2.5 px-3 text-brand-charcoal shadow-sm placeholder:text-gray-400 focus:outline-none focus:border-brand-gold sm:text-sm bg-white font-sans transition-colors"
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-brand-charcoal py-3 px-4 text-xs font-sans uppercase font-bold tracking-widest text-brand-cream shadow-md hover:bg-opacity-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Submitting Application..." : "Submit Application"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-xs font-sans tracking-wide">
            <span className="text-gray-500">Already registered? </span>
            <Link
              href="/seller/login"
              className="font-bold text-brand-gold hover:text-brand-gold-light transition-colors border-b border-brand-gold/30 hover:border-brand-gold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
