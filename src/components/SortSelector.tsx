"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SortSelectorInner({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("sort", e.target.value);
    router.push(`/shop?${nextParams.toString()}`);
  };

  return (
    <select
      onChange={handleSortChange}
      defaultValue={defaultValue}
      className="bg-white border border-[#E8DFC8] rounded py-1 px-2 text-xs font-sans text-brand-charcoal focus:outline-none focus:border-brand-gold cursor-pointer"
    >
      <option value="newest">Newest First</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
    </select>
  );
}

export default function SortSelector({ defaultValue }: { defaultValue: string }) {
  return (
    <Suspense fallback={
      <select
        defaultValue={defaultValue}
        disabled
        className="bg-white border border-[#E8DFC8] rounded py-1 px-2 text-xs font-sans text-gray-400 cursor-not-allowed"
      >
        <option value={defaultValue}>Loading...</option>
      </select>
    }>
      <SortSelectorInner defaultValue={defaultValue} />
    </Suspense>
  );
}
