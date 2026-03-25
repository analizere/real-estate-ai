"use client";

import { useMemo, useState } from "react";

type DealAnalysisProps = {
  initialPurchasePrice: number;
};

const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const percentFmt = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

type FieldDef = {
  key: keyof Inputs;
  label: string;
  step?: string;
};

type Inputs = {
  purchasePrice: string;
  monthlyRent: string;
  downPaymentPercent: string;
  interestRate: string;
  loanTermYears: string;
  rehabCost: string;
  annualPropertyTax: string;
  annualInsurance: string;
  monthlyHoa: string;
  monthlyMaintenance: string;
  monthlyVacancyAllowance: string;
};

function toNumber(value: string, fallback: number) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function DealAnalysis({ initialPurchasePrice }: DealAnalysisProps) {
  const [inputs, setInputs] = useState<Inputs>({
    purchasePrice: String(initialPurchasePrice),
    monthlyRent: String(Math.round(initialPurchasePrice * 0.007)),
    downPaymentPercent: "20",
    interestRate: "6.5",
    loanTermYears: "30",
    rehabCost: "15000",
    annualPropertyTax: "4200",
    annualInsurance: "1500",
    monthlyHoa: "150",
    monthlyMaintenance: "200",
    monthlyVacancyAllowance: "120",
  });

  const values = useMemo(() => {
    const purchasePrice = toNumber(inputs.purchasePrice, initialPurchasePrice);
    const monthlyRent = toNumber(inputs.monthlyRent, Math.round(initialPurchasePrice * 0.007));
    const downPaymentPercent = toNumber(inputs.downPaymentPercent, 20);
    const interestRate = toNumber(inputs.interestRate, 6.5);
    const loanTermYears = Math.max(1, toNumber(inputs.loanTermYears, 30));
    const rehabCost = toNumber(inputs.rehabCost, 15000);
    const annualPropertyTax = toNumber(inputs.annualPropertyTax, 4200);
    const annualInsurance = toNumber(inputs.annualInsurance, 1500);
    const monthlyHoa = toNumber(inputs.monthlyHoa, 150);
    const monthlyMaintenance = toNumber(inputs.monthlyMaintenance, 200);
    const monthlyVacancyAllowance = toNumber(inputs.monthlyVacancyAllowance, 120);

    return {
      purchasePrice,
      monthlyRent,
      downPaymentPercent,
      interestRate,
      loanTermYears,
      rehabCost,
      annualPropertyTax,
      annualInsurance,
      monthlyHoa,
      monthlyMaintenance,
      monthlyVacancyAllowance,
    };
  }, [initialPurchasePrice, inputs]);

  const metrics = useMemo(() => {
    const downPaymentAmount =
      values.purchasePrice * (values.downPaymentPercent / 100);
    const loanAmount = Math.max(0, values.purchasePrice - downPaymentAmount);

    const monthlyRate = values.interestRate / 100 / 12;
    const totalPayments = values.loanTermYears * 12;

    const monthlyMortgagePayment =
      monthlyRate === 0
        ? loanAmount / totalPayments
        : (loanAmount * monthlyRate * (1 + monthlyRate) ** totalPayments) /
          ((1 + monthlyRate) ** totalPayments - 1);

    const monthlyTax = values.annualPropertyTax / 12;
    const monthlyInsurance = values.annualInsurance / 12;

    const totalMonthlyExpenses =
      monthlyMortgagePayment +
      monthlyTax +
      monthlyInsurance +
      values.monthlyHoa +
      values.monthlyMaintenance +
      values.monthlyVacancyAllowance;

    const monthlyCashFlow = values.monthlyRent - totalMonthlyExpenses;

    const annualOperatingIncome =
      values.monthlyRent * 12 -
      (values.annualPropertyTax +
        values.annualInsurance +
        (values.monthlyHoa +
          values.monthlyMaintenance +
          values.monthlyVacancyAllowance) *
          12);

    const totalProjectCost = values.purchasePrice + values.rehabCost;
    const capRate =
      totalProjectCost > 0 ? annualOperatingIncome / totalProjectCost : 0;

    const cashInvested = downPaymentAmount + values.rehabCost;
    const annualCashFlow = monthlyCashFlow * 12;
    const cashOnCashReturn =
      cashInvested > 0 ? annualCashFlow / cashInvested : 0;

    return {
      loanAmount,
      monthlyMortgagePayment,
      totalMonthlyExpenses,
      monthlyCashFlow,
      capRate,
      cashOnCashReturn,
    };
  }, [values]);

  const fields: FieldDef[] = [
    { key: "purchasePrice", label: "Purchase price" },
    { key: "monthlyRent", label: "Monthly rent" },
    { key: "downPaymentPercent", label: "Down payment %", step: "0.1" },
    { key: "interestRate", label: "Interest rate", step: "0.01" },
    { key: "loanTermYears", label: "Loan term in years" },
    { key: "rehabCost", label: "Rehab cost" },
    { key: "annualPropertyTax", label: "Annual property tax" },
    { key: "annualInsurance", label: "Annual insurance" },
    { key: "monthlyHoa", label: "Monthly HOA" },
    { key: "monthlyMaintenance", label: "Monthly maintenance" },
    { key: "monthlyVacancyAllowance", label: "Monthly vacancy allowance" },
  ];

  return (
    <section className="space-y-4 rounded-xl border border-[#dbe8ff] bg-[#f8fbff] p-5">
      <div>
        <h2 className="text-lg font-semibold text-[#1a1a1a]">Deal analysis</h2>
        <p className="mt-1 text-sm text-[#4f5b71]">
          Update any input to recalculate metrics instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className="space-y-1">
            <span className="text-sm text-[#4f5b71]">{field.label}</span>
            <input
              inputMode="decimal"
              type="number"
              step={field.step ?? "1"}
              value={inputs[field.key]}
              onChange={(event) =>
                setInputs((prev) => ({ ...prev, [field.key]: event.target.value }))
              }
              className="h-10 w-full rounded-lg border border-[#c8d8f8] bg-white px-3 text-sm text-[#1a1a1a] outline-none transition-[border-color,box-shadow] focus:border-[#006aff] focus:ring-2 focus:ring-[#006aff]/20"
            />
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ResultCard label="Loan amount" value={currencyFmt.format(metrics.loanAmount)} />
        <ResultCard
          label="Monthly mortgage payment"
          value={currencyFmt.format(metrics.monthlyMortgagePayment)}
        />
        <ResultCard
          label="Total monthly expenses"
          value={currencyFmt.format(metrics.totalMonthlyExpenses)}
        />
        <ResultCard
          label="Monthly cash flow"
          value={currencyFmt.format(metrics.monthlyCashFlow)}
          positiveNegative
        />
        <ResultCard label="Cap rate" value={percentFmt.format(metrics.capRate)} />
        <ResultCard
          label="Cash-on-cash return"
          value={percentFmt.format(metrics.cashOnCashReturn)}
        />
      </div>

      <p className="text-xs text-[#63708a]">
        Estimates only. This simplified model excludes closing costs, utilities,
        management fees, and local market variability.
      </p>
    </section>
  );
}

type ResultCardProps = {
  label: string;
  value: string;
  positiveNegative?: boolean;
};

function ResultCard({ label, value, positiveNegative }: ResultCardProps) {
  const isNegative = positiveNegative && value.includes("-");
  return (
    <div className="rounded-lg border border-[#d6e3ff] bg-white p-3">
      <p className="text-xs uppercase tracking-wide text-[#63708a]">{label}</p>
      <p
        className={`mt-1 text-lg font-semibold ${isNegative ? "text-[#b42318]" : "text-[#1a1a1a]"}`}
      >
        {value}
      </p>
    </div>
  );
}
