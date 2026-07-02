"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    router.replace(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }, [router, callbackUrl]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-brand-cream">
      <p className="font-serif text-lg text-brand-gold tracking-widest lowercase animate-pulse">
        redirecting to secure login...
      </p>
    </div>
  );
}

export default function RegisterPage() {
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
      <RegisterForm />
    </Suspense>
  );
}
