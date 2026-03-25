"use client";

import { useMemo, useState } from "react";
import type {
  SharedFinancialInputs,
  SharedFinancialSetters,
} from "./PropertyAnalysisClient";

type BRRRRAnalysisProps = {
  initialPurchasePrice: number;
  sharedValues: SharedFinancialInputs;
  sharedSetters: SharedFinancialSetters;
};

type Inputs = {
  carryingCosts: string;
  afterRepairValue: string;
  maxRefinanceLtvPercent: string;
  refinanceInterestRate: string;
  loanTermYears: string;
  originalDownPaymentPercent: string;
  annualPropertyTax: string;
  annualInsurance: string;
  monthlyExpenses: string;
  vacancyPercent: string;
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

const percentFmt = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export default function BRRRRAnalysis({
  initialPurchasePrice,
  sharedValues,
  sharedSetters,
}: BRRRRAnalysisProps) {
  const [inputs, setInputs] = useState<Inputs>({
    carryingCosts: "5000",
    afterRepairValue: String(Math.round(initialPurchasePrice * 1.25)),
    maxRefinanceLtvPercent: "75",
    refinanceInterestRate: "6.75",
    loanTermYears: "30",
    originalDownPaymentPercent: "20",
    annualPropertyTax: "4200",
    annualInsurance: "1500",
    monthlyExpenses: "350",
    vacancyPercent: "5",
  });

  const values = useMemo(() => {
    const purchasePrice = toNumber(sharedValues.purchasePrice, initialPurchasePrice);
    const rehabCost = toNumber(sharedValues.rehabCost, initialPurchasePrice * 0.08);
    const carryingCosts = toNumber(inputs.carryingCosts, 5000);
    const afterRepairValue = toNumber(
      inputs.afterRepairValue,
      initialPurchasePrice * 1.25,
    );
    const maxRefinanceLtvPercent = toNumber(inputs.maxRefinanceLtvPercent, 75);
    const refinanceInterestRate = toNumber(inputs.refinanceInterestRate, 6.75);
    const loanTermYears = Math.max(1, toNumber(inputs.loanTermYears, 30));
    const originalDownPaymentPercent = toNumber(
      inputs.originalDownPaymentPercent,
      20,
    );
    const estimatedNewMonthlyRent = toNumber(
      sharedValues.monthlyRent,
      Math.round(initialPurchasePrice * 0.007),
    );
    const annualPropertyTax = toNumber(inputs.annualPropertyTax, 4200);
    const annualInsurance = toNumber(inputs.annualInsurance, 1500);
    const monthlyExpenses = toNumber(inputs.monthlyExpenses, 350);
    const vacancyPercent = toNumber(inputs.vacancyPercent, 5);

    return {
      purchasePrice,
      rehabCost,
      carryingCosts,
      afterRepairValue,
      maxRefinanceLtvPercent,
      refinanceInterestRate,
      loanTermYears,
      originalDownPaymentPercent,
      estimatedNewMonthlyRent,
      annualPropertyTax,
      annualInsurance,
      monthlyExpenses,
      vacancyPercent,
    };
  }, [initialPurchasePrice, inputs, sharedValues.monthlyRent, sharedValues.purchasePrice, sharedValues.rehabCost]);

  const metrics = useMemo(() => {
    const originalLoanAmount =
      values.purchasePrice * (1 - values.originalDownPaymentPercent / 100);
    const cashInvestedBeforeRefinance =
      values.purchasePrice * (values.originalDownPaymentPercent / 100) +
      values.rehabCost +
      values.carryingCosts;
    const maxRefinanceLoanAmount =
      values.afterRepairValue * (values.maxRefinanceLtvPercent / 100);

    const cashPulledOutAtRefinance = Math.max(
      0,
      maxRefinanceLoanAmount - originalLoanAmount,
    );
    const equityInHomeAfterRefinance = Math.max(
      0,
      values.afterRepairValue - maxRefinanceLoanAmount,
    );
    const cashLeftInDeal = cashInvestedBeforeRefinance - cashPulledOutAtRefinance;

    const monthlyRate = values.refinanceInterestRate / 100 / 12;
    const totalPayments = values.loanTermYears * 12;
    const estimatedNewMonthlyPayment =
      monthlyRate === 0
        ? maxRefinanceLoanAmount / totalPayments
        : (maxRefinanceLoanAmount *
            monthlyRate *
            (1 + monthlyRate) ** totalPayments) /
          ((1 + monthlyRate) ** totalPayments - 1);

    const monthlyTax = values.annualPropertyTax / 12;
    const monthlyInsurance = values.annualInsurance / 12;
    const monthlyVacancyAllowance =
      values.estimatedNewMonthlyRent * (values.vacancyPercent / 100);
    const totalMonthlyExpenses =
      estimatedNewMonthlyPayment +
      monthlyTax +
      monthlyInsurance +
      values.monthlyExpenses +
      monthlyVacancyAllowance;
    const newMonthlyCashFlowAfterRefinance =
      values.estimatedNewMonthlyRent - totalMonthlyExpenses;

    const annualOperatingIncome =
      values.estimatedNewMonthlyRent * 12 -
      (values.annualPropertyTax +
        values.annualInsurance +
        (values.monthlyExpenses + monthlyVacancyAllowance) * 12);

    const annualCashFlow =
      newMonthlyCashFlowAfterRefinance * 12;
    const capRate =
      values.afterRepairValue > 0 ? annualOperatingIncome / values.afterRepairValue : 0;
    const cashOnCashReturn =
      cashLeftInDeal > 0 ? annualCashFlow / cashLeftInDeal : null;

    return {
      cashInvestedBeforeRefinance,
      maxRefinanceLoanAmount,
      cashPulledOutAtRefinance,
      equityInHomeAfterRefinance,
      cashLeftInDeal,
      estimatedNewMonthlyPayment,
      estimatedNewMonthlyRent: values.estimatedNewMonthlyRent,
      newMonthlyCashFlowAfterRefinance,
      capRate,
      cashOnCashReturn,
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
          label="Purchase price"
          value={sharedValues.purchasePrice}
          onChange={sharedSetters.setPurchasePrice}
        />
        <InputField
          label="Rehab cost"
          value={sharedValues.rehabCost}
          onChange={sharedSetters.setRehabCost}
        />
        <InputField
          label="Carrying costs"
          value={inputs.carryingCosts}
          onChange={(value) =>
            setInputs((prev) => ({ ...prev, carryingCosts: value }))
          }
        />
        <InputField
          label="After Repair Value (ARV)"
          value={inputs.afterRepairValue}
          onChange={(value) =>
            setInputs((prev) => ({ ...prev, afterRepairValue: value }))
          }
        />
        <InputField
          label="Max Refinance LTV %"
          value={inputs.maxRefinanceLtvPercent}
          step="0.1"
          onChange={(value) =>
            setInputs((prev) => ({ ...prev, maxRefinanceLtvPercent: value }))
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
        <InputField
          label="Original down payment %"
          value={inputs.originalDownPaymentPercent}
          step="0.1"
          onChange={(value) =>
            setInputs((prev) => ({ ...prev, originalDownPaymentPercent: value }))
          }
        />
        <InputField
          label="Estimated new monthly rent"
          value={sharedValues.monthlyRent}
          onChange={sharedSetters.setMonthlyRent}
        />
        <InputField
          label="Annual property tax"
          value={inputs.annualPropertyTax}
          onChange={(value) =>
            setInputs((prev) => ({ ...prev, annualPropertyTax: value }))
          }
        />
        <InputField
          label="Annual insurance"
          value={inputs.annualInsurance}
          onChange={(value) =>
            setInputs((prev) => ({ ...prev, annualInsurance: value }))
          }
        />
        <InputField
          label="Monthly expenses (HOA, maintenance)"
          value={inputs.monthlyExpenses}
          onChange={(value) =>
            setInputs((prev) => ({ ...prev, monthlyExpenses: value }))
          }
        />
        <InputField
          label="Vacancy %"
          value={inputs.vacancyPercent}
          step="0.1"
          onChange={(value) =>
            setInputs((prev) => ({ ...prev, vacancyPercent: value }))
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ResultCard
          label="Cash invested before refinance"
          value={currencyFmt.format(metrics.cashInvestedBeforeRefinance)}
        />
        <ResultCard
          label="Max refinance loan amount"
          value={currencyFmt.format(metrics.maxRefinanceLoanAmount)}
        />
        <ResultCard
          label="Cash pulled out at refinance"
          value={currencyFmt.format(metrics.cashPulledOutAtRefinance)}
        />
        <ResultCard
          label="Equity in home after refinance"
          value={currencyFmt.format(metrics.equityInHomeAfterRefinance)}
        />
        <ResultCard
          label="Cash left in deal"
          value={currencyFmt.format(metrics.cashLeftInDeal)}
        />
        <ResultCard
          label="Estimated new monthly payment"
          value={currencyFmt.format(metrics.estimatedNewMonthlyPayment)}
        />
        <ResultCard
          label="Estimated new monthly rent"
          value={currencyFmt.format(metrics.estimatedNewMonthlyRent)}
        />
        <ResultCard
          label="New monthly cash flow after refinance"
          value={currencyFmt.format(metrics.newMonthlyCashFlowAfterRefinance)}
        />
        <ResultCard label="Cap rate" value={percentFmt.format(metrics.capRate)} />
        <ResultCard
          label="Cash-on-cash return after refinance"
          value={
            metrics.cashOnCashReturn === null
              ? "N/A"
              : percentFmt.format(metrics.cashOnCashReturn)
          }
        />
      </div>

      <p className="text-xs text-[#63708a]">
        Cash-on-cash return is based on post-refinance cash flow (rent minus all
        post-refinance monthly costs) divided by cash left in the deal.
      </p>

      <p className="text-xs text-[#63708a]">
        BRRRR results are estimates and depend on lender terms, appraisal,
        timing, and market conditions.
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
