"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MOCK_PROPERTIES } from "@/lib/mock-properties";

const priceFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const sqftFmt = new Intl.NumberFormat("en-US");

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function BedIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 4v16" />
      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
      <path d="M2 17h20" />
      <path d="M6 8v9" />
    </svg>
  );
}

function BathIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10 4 8 6" />
      <path d="M17 19v2" />
      <path d="M2 12h20" />
      <path d="M7 19v2" />
      <path d="M9 5 7.621 3.621A2.121 2.121 0 0 0 4 5v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
    </svg>
  );
}

function SqftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_PROPERTIES;
    return MOCK_PROPERTIES.filter((p) => {
      const hay = `${p.address} ${p.city} ${p.state} ${p.zip} ${priceFmt.format(p.price)}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  return (
    <div className="min-h-full flex flex-col bg-[#e8e8e6] text-[#1a1a1a]">
      <header className="sticky top-0 z-20 border-b border-black/[0.06] bg-white/90 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-[#006aff]">
              HomeSearch
            </span>
            <span className="rounded-full bg-[#006aff]/10 px-2 py-0.5 text-xs font-medium text-[#006aff]">
              Buy
            </span>
          </div>

          <div className="relative w-full sm:max-w-xl">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#767676]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search properties..."
              className="h-11 w-full rounded-lg border border-[#d1d1d1] bg-white pl-10 pr-4 text-[15px] text-[#1a1a1a] shadow-inner outline-none placeholder:text-[#767676] transition-[border-color,box-shadow] focus:border-[#006aff] focus:ring-2 focus:ring-[#006aff]/25"
              aria-label="Search properties by address, city, or price"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1a1a1a]">
              Homes for sale
            </h1>
            <p className="mt-1 text-sm text-[#535353]">
              {filtered.length === MOCK_PROPERTIES.length
                ? `${MOCK_PROPERTIES.length} results in Oregon`
                : `${filtered.length} matching “${query.trim()}”`}
            </p>
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <li key={p.id}>
              <Link
                href={`/property/${p.id}`}
                className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006aff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#e8e8e6]"
              >
                <article className="group overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
                <div
                  className={`relative aspect-[5/3] bg-gradient-to-br ${p.imageClass}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                  <span className="absolute bottom-2 left-2 rounded bg-white/95 px-2 py-0.5 text-xs font-semibold text-[#1a1a1a] shadow-sm">
                    For sale
                  </span>
                </div>

                <div className="space-y-3 p-4">
                  <p className="text-2xl font-bold tracking-tight text-[#1a1a1a]">
                    {priceFmt.format(p.price)}
                  </p>
                  <p className="text-[15px] leading-snug text-[#1a1a1a]">
                    {p.address}
                    <br />
                    <span className="text-[#535353]">
                      {p.city}, {p.state} {p.zip}
                    </span>
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-[#ebebeb] pt-3 text-sm text-[#535353]">
                    <span className="inline-flex items-center gap-1.5">
                      <BedIcon className="size-4 text-[#767676]" />
                      <strong className="font-semibold text-[#1a1a1a]">{p.beds}</strong>{" "}
                      bd
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <BathIcon className="size-4 text-[#767676]" />
                      <strong className="font-semibold text-[#1a1a1a]">{p.baths}</strong>{" "}
                      ba
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <SqftIcon className="size-4 text-[#767676]" />
                      <strong className="font-semibold text-[#1a1a1a]">
                        {sqftFmt.format(p.sqft)}
                      </strong>{" "}
                      sqft
                    </span>
                  </div>
                </div>
                </article>
              </Link>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <p className="rounded-xl border border-dashed border-[#d1d1d1] bg-white py-16 text-center text-[#535353]">
            No properties match your search. Try another address or city.
          </p>
        )}
      </main>
    </div>
  );
}
