"use client";

import { useState } from "react";
import DealAnalysis from "./DealAnalysis";
import BRRRRAnalysis from "./BRRRRAnalysis";

type PropertyAnalysisClientProps = {
  initialPurchasePrice: number;
};

export type SharedFinancialInputs = {
  purchasePrice: string;
  rehabCost: string;
  monthlyRent: string;
};

export type SharedFinancialSetters = {
  setPurchasePrice: (value: string) => void;
  setRehabCost: (value: string) => void;
  setMonthlyRent: (value: string) => void;
};

const DEFAULT_REHAB_COST = "15000";

export default function PropertyAnalysisClient({
  initialPurchasePrice,
}: PropertyAnalysisClientProps) {
  const [purchasePrice, setPurchasePrice] = useState(String(initialPurchasePrice));
  const [rehabCost, setRehabCost] = useState(DEFAULT_REHAB_COST);
  const [monthlyRent, setMonthlyRent] = useState(
    String(Math.round(initialPurchasePrice * 0.007)),
  );

  const sharedValues: SharedFinancialInputs = {
    purchasePrice,
    rehabCost,
    monthlyRent,
  };

  const sharedSetters: SharedFinancialSetters = {
    setPurchasePrice,
    setRehabCost,
    setMonthlyRent,
  };

  return (
    <>
      <DealAnalysis
        initialPurchasePrice={initialPurchasePrice}
        sharedValues={sharedValues}
        sharedSetters={sharedSetters}
      />
      <BRRRRAnalysis
        initialPurchasePrice={initialPurchasePrice}
        sharedValues={sharedValues}
        sharedSetters={sharedSetters}
      />
    </>
  );
}
