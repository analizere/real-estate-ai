"use client";

import { useMemo, useState } from "react";

type BRRRRAnalysisProps = {
  initialPurchasePrice: number;
};

type Inputs = {
  purchasePrice: string;
  rehabCost: string;
  afterRepairValue: string;
  refinanceLtvPercent: string;
  refinanceInterestRate: string;
  loanTermYears: string;
};

const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function toNumber(value: string, fallback: number) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function BRRRRAnalysis({ initialPurchasePrice }: BRRRRAnalysisProps) {
  const [inputs, setInputs] = useState<Inputs>({
    purchasePrice: String(initialPurchasePrice),
    rehabCost: String(Math.round(initialPurchasePrice * 0.08)),
    afterRepairValue: String(Math.round(initialPurchasePrice * 1.25)),
    refinanceLtvPercent: "75",
    refinanceInterestRate: "6.75",
    loanTermYears: "30",
  });

  const values = useMemo(() => {
    const purchasePrice = toNumber(inputs.purchasePrice, initialPurchasePrice);
    const rehabCost = toNumber(inputs.rehabCost, initialPurchasePrice * 0.08);
    const afterRepairValue = toNumber(
      inputs.afterRepairValue,
      initialPurchasePrice * 1.25,
    );
    const refinanceLtvPercent = toNumber(inputs.refinanceLtvPercent, 75);
    const refinanceInterestRate = toNumber(inputs.refinanceInterestRate, 6.75);
    const loanTermYears = Math.max(1, toNumber(inputs.loanTermYears, 30));

    return {
      purchasePrice,
      rehabCost,
      afterRepairValue,
      refinanceLtvPercent,
      refinanceInterestRate,
      loanTermYears,
    };
  }, [initialPurchasePrice, inputs]);

  const metrics = useMemo(() => {
    const totalInvestment = values.purchasePrice + values.rehabCost;
    const estimatedRefinanceLoanAmount =
      values.afterRepairValue * (values.refinanceLtvPercent / 100);

    // Simplified BRRRR view: refinance proceeds are used to recover invested cash.
    const cashPulledOutAtRefinance = Math.min(
      totalInvestment,
      Math.max(0, estimatedRefinanceLoanAmount),
    );
    const cashRemainingInDeal = Math.max(
      0,
      totalInvestment - cashPulledOutAtRefinance,
    );

    const monthlyRate = values.refinanceInterestRate / 100 / 12;
    const totalPayments = values.loanTermYears * 12;
    const estimatedNewMonthlyMortgageAfterRefinance =
      monthlyRate === 0
        ? estimatedRefinanceLoanAmount / totalPayments
        : (estimatedRefinanceLoanAmount *
            monthlyRate *
            (1 + monthlyRate) ** totalPayments) /
          ((1 + monthlyRate) ** totalPayments - 1);

    return {
      totalInvestment,
      estimatedRefinanceLoanAmount,
      cashPulledOutAtRefinance,
      cashRemainingInDeal,
      estimatedNewMonthlyMortgageAfterRefinance,
    };
  }, [values]);

  return (
    <section className="space-y-4 rounded-xl border border-[#dbe8ff] bg-[#f8fbff] p-5">
      <div>
        <h2 className="text-lg font-semibold text-[#1a1a1a]">BRRRR Analysis</h2>
        <p className="mt-1 text-sm text-[#4f5b71]">
          Update any input to recalculate refinance outcomes instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InputField
          label="Purchase price (pre-filled)"
          value={inputs.purchasePrice}
          onChange={(value) => setInputs((prev) => ({ ...prev, purchasePrice: value }))}
        />
        <InputField
          label="Rehab cost"
          value={inputs.rehabCost}
          onChange={(value) => setInputs((prev) => ({ ...prev, rehabCost: value }))}
        />
        <InputField
          label="After Repair Value (ARV)"
          value={inputs.afterRepairValue}
          onChange={(value) =>
            setInputs((prev) => ({ ...prev, afterRepairValue: value }))
          }
        />
        <InputField
          label="Refinance LTV %"
          value={inputs.refinanceLtvPercent}
          step="0.1"
          onChange={(value) =>
            setInputs((prev) => ({ ...prev, refinanceLtvPercent: value }))
          }
        />
        <InputField
          label="Refinance interest rate"
          value={inputs.refinanceInterestRate}
          step="0.01"
          onChange={(value) =>
            setInputs((prev) => ({ ...prev, refinanceInterestRate: value }))
          }
        />
        <InputField
          label="Loan term (years)"
          value={inputs.loanTermYears}
          onChange={(value) => setInputs((prev) => ({ ...prev, loanTermYears: value }))}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ResultCard
          label="Total investment"
          value={currencyFmt.format(metrics.totalInvestment)}
        />
        <ResultCard
          label="Estimated refinance loan amount"
          value={currencyFmt.format(metrics.estimatedRefinanceLoanAmount)}
        />
        <ResultCard
          label="Cash pulled out at refinance"
          value={currencyFmt.format(metrics.cashPulledOutAtRefinance)}
        />
        <ResultCard
          label="Cash remaining in the deal"
          value={currencyFmt.format(metrics.cashRemainingInDeal)}
        />
        <ResultCard
          label="Estimated new monthly mortgage after refinance"
          value={currencyFmt.format(
            metrics.estimatedNewMonthlyMortgageAfterRefinance,
          )}
        />
      </div>

      <p className="text-xs text-[#63708a]">
        BRRRR results are estimates and depend on appraisal, lender terms, and
        market conditions.
      </p>
    </section>
  );
}

type InputFieldProps = {
  label: string;
  value: string;
  step?: string;
  onChange: (value: string) => void;
};

function InputField({ label, value, step = "1", onChange }: InputFieldProps) {
  return (
    <label className="space-y-1">
      <span className="text-sm text-[#4f5b71]">{label}</span>
      <input
        inputMode="decimal"
        type="number"
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-[#c8d8f8] bg-white px-3 text-sm text-[#1a1a1a] outline-none transition-[border-color,box-shadow] focus:border-[#006aff] focus:ring-2 focus:ring-[#006aff]/20"
      />
    </label>
  );
}

type ResultCardProps = {
  label: string;
  value: string;
};

function ResultCard({ label, value }: ResultCardProps) {
  return (
    <div className="rounded-lg border border-[#d6e3ff] bg-white p-3">
      <p className="text-xs uppercase tracking-wide text-[#63708a]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[#1a1a1a]">{value}</p>
    </div>
  );
}
