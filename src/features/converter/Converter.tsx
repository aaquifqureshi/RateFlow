import { useEffect, useState } from "react";
import CurrencyDropdown from "./CurrencyDropdown";
import AmountInput from "./AmountInput";
import RateInfo from "./RateInfo";
import Card from "../../components/Card";

type Rates = Record<string, number>;

export default function Converter({
  currencies,
  rates,
  loading,
  from,
  to,
  setFrom,
  setTo,
  amount,
  setAmount,
}: {
  currencies: string[];
  rates: Rates;
  loading: boolean;
  from: string;
  to: string;
  setFrom: (s: string) => void;
  setTo: (s: string) => void;
  amount: number;
  setAmount: (n: number) => void;
}) {
  const [leftAmount, setLeftAmount] = useState<string>(String(amount || ""));
  const [rightAmount, setRightAmount] = useState<string>("");

  useEffect(() => {
    if (!currencies.length) return;

    if (!currencies.includes(from)) setFrom(currencies[0]);
    if (!currencies.includes(to))
      setTo(currencies.length > 1 ? currencies[1] : currencies[0]);
  }, [currencies, from, setFrom, setTo, to]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLeftAmount(String(amount ?? ""));
  }, [amount]);

  const swapCurrencies = () => {
    setFrom(to);
    setTo(from);

    setLeftAmount((prevLeft) => {
      const prevRight = rightAmount;
      setRightAmount(prevLeft);
      const newLeft = prevRight ?? "";
      const parsed = Number(newLeft);
      setAmount(!newLeft || Number.isNaN(parsed) ? 0 : parsed);
      return newLeft;
    });
  };

  const handleLeftChange = (v: string) => {
    setLeftAmount(v);

    const amt = Number(v);
    setAmount(!v || Number.isNaN(amt) ? 0 : amt);

    if (!v || Number.isNaN(amt) || !rates[from] || !rates[to]) {
      setRightAmount("");
      return;
    }
    const usd = amt / Number(rates[from]);
    const finalValue = usd * Number(rates[to]);
    setRightAmount(finalValue.toFixed(2));
  };

  const handleRightChange = (v: string) => {
    setRightAmount(v);

    const amt = Number(v);
    if (!v || Number.isNaN(amt) || !rates[from] || !rates[to]) {
      setLeftAmount("");
      setAmount(0);
      return;
    }
    const usd = amt / Number(rates[to]);
    const finalLeft = usd * Number(rates[from]);
    const f = finalLeft.toFixed(2);
    setLeftAmount(f);
    setAmount(Number(f));
  };

  useEffect(() => {
    if (!leftAmount) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRightAmount("");
      return;
    }
    if (!rates[from] || !rates[to]) return;

    const handler = setTimeout(() => {
      const amt = Number(leftAmount);
      if (Number.isNaN(amt)) {
        setRightAmount("");
        return;
      }
      const usd = amt / Number(rates[from]);
      const finalValue = usd * Number(rates[to]);
      setRightAmount(finalValue.toFixed(2));
    }, 300);

    return () => clearTimeout(handler);
  }, [leftAmount, from, to, rates]);

  return (
    <div className="w-full pt-10">
      <div className="pl-4 md:pl-10">
        {/* ONLY THIS PART CHANGED */}
        <Card size="lg" className="w-fit bg-white rounded-xl shadow-md">
          {/* EVERYTHING BELOW IS EXACTLY THE SAME AS BEFORE */}
          <div className="flex items-start justify-start gap-6 flex-wrap md:flex-nowrap">
            <div className="flex flex-col gap-10">
              <CurrencyDropdown
                value={from}
                onChange={setFrom}
                options={currencies}
                className="currency-select"
              />
              <AmountInput
                value={leftAmount}
                onChange={handleLeftChange}
                disabled={loading}
                placeholder="Enter amount"
              />
            </div>

            <div className="flex flex-col items-center justify-center mt-10">
              <button
                type="button"
                onClick={swapCurrencies}
                className="px-6 py-2 border rounded-full shadow-sm hover:bg-gray-100 transition"
              >
                ⇆
              </button>
            </div>

            <div className="flex flex-col gap-10">
              <CurrencyDropdown
                value={to}
                onChange={setTo}
                options={currencies}
                className="currency-select"
              />
              <AmountInput
                value={rightAmount}
                onChange={handleRightChange}
                disabled={loading}
                placeholder="Converted amount"
              />
            </div>
          </div>

          <RateInfo from={from} to={to} rates={rates} className="mt-4" />
        </Card>
      </div>
    </div>
  );
}
