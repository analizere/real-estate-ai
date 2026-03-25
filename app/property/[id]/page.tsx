import Link from "next/link";
import { notFound } from "next/navigation";
import { getPropertyById } from "@/lib/mock-properties";

const priceFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const sqftFmt = new Intl.NumberFormat("en-US");

type PropertyPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const property = getPropertyById(id);

  if (!property) {
    notFound();
  }

  return (
    <div className="min-h-full bg-[#e8e8e6] text-[#1a1a1a]">
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-[#006aff] hover:text-[#0052c8]"
          >
            ← Back to search
          </Link>
        </div>

        <article className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <div
            className={`relative aspect-[16/7] bg-gradient-to-br ${property.imageClass}`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
            <span className="absolute bottom-3 left-3 rounded bg-white/95 px-2.5 py-1 text-xs font-semibold text-[#1a1a1a] shadow-sm">
              Property #{property.id}
            </span>
          </div>

          <div className="space-y-7 p-6 sm:p-8">
            <section>
              <p className="text-3xl font-bold tracking-tight text-[#1a1a1a]">
                {priceFmt.format(property.price)}
              </p>
              <h1 className="mt-2 text-xl font-semibold leading-snug text-[#1a1a1a] sm:text-2xl">
                {property.address}
                <span className="block text-base font-normal text-[#535353] sm:text-lg">
                  {property.city}, {property.state} {property.zip}
                </span>
              </h1>
            </section>

            <section className="grid grid-cols-1 gap-3 rounded-xl border border-[#e8e8e8] bg-[#fcfcfc] p-4 text-sm sm:grid-cols-3 sm:text-base">
              <p>
                <span className="text-[#767676]">Beds</span>
                <span className="ml-2 font-semibold text-[#1a1a1a]">
                  {property.beds}
                </span>
              </p>
              <p>
                <span className="text-[#767676]">Baths</span>
                <span className="ml-2 font-semibold text-[#1a1a1a]">
                  {property.baths}
                </span>
              </p>
              <p>
                <span className="text-[#767676]">Square feet</span>
                <span className="ml-2 font-semibold text-[#1a1a1a]">
                  {sqftFmt.format(property.sqft)}
                </span>
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-[#1a1a1a]">
                Property description
              </h2>
              <p className="max-w-3xl text-[15px] leading-7 text-[#535353]">
                {property.description}
              </p>
            </section>

            <section className="rounded-xl border border-dashed border-[#ccdfff] bg-[#f8fbff] p-5">
              <h2 className="text-lg font-semibold text-[#1a1a1a]">
                Investment Analysis
              </h2>
              <p className="mt-2 text-[15px] leading-7 text-[#4f5b71]">
                Placeholder: cap rate, projected rent, and cash flow metrics will
                be displayed here.
              </p>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
}
