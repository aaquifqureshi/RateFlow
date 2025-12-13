import { useEffect, useRef, useState } from "react";
import CurrencyDropdown from "./CurrencyDropdown";
import AmountInput from "./AmountInput";
import RateInfo from "./RateInfo";
import Card from "../../components/Card";
import { CURRENCY_NAMES } from "./currencyName";
import { getFlagEmoji } from "../../components/currencyHelper";
import Divider from "../../components/Divider";

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
  const [activeSide, setActiveSide] = useState<"left" | "right">("left");
  const isSwappingRef = useRef(false);
  const NORMALIZE_THRESHOLD = 0.1;

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
    isSwappingRef.current = true;

    const currentBase = Number(leftAmount);
    const shouldNormalize =
      Number.isNaN(currentBase) || currentBase < NORMALIZE_THRESHOLD;

    const newBase = shouldNormalize ? 1 : currentBase;

    setFrom(to);
    setTo(from);

    setLeftAmount(String(newBase));
    setAmount(newBase);

    if (!rates[from] || !rates[to]) {
      setRightAmount("");
      return;
    }

    const usd = newBase / Number(rates[to]);
    const finalValue = usd * Number(rates[from]);
    setRightAmount(finalValue.toFixed(3));
  };

  const handleLeftChange = (v: string) => {
    setActiveSide("left");
    setLeftAmount(v);

    const amt = Number(v);
    setAmount(!v || Number.isNaN(amt) ? 0 : amt);

    if (!v || Number.isNaN(amt) || !rates[from] || !rates[to]) {
      setRightAmount("");
      return;
    }

    const usd = amt / rates[from];
    setRightAmount((usd * rates[to]).toFixed(2));
  };

  const handleRightChange = (v: string) => {
    setActiveSide("right");
    setRightAmount(v);

    const amt = Number(v);
    if (!v || Number.isNaN(amt) || !rates[from] || !rates[to]) {
      setLeftAmount("");
      setAmount(0);
      return;
    }

    const usd = amt / rates[to];
    const left = usd * rates[from];
    setLeftAmount(left.toFixed(2));
    setAmount(left);
  };

  useEffect(() => {
    if (isSwappingRef.current) {
      isSwappingRef.current = false;
      return;
    }

    if (!leftAmount) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRightAmount("");
      return;
    }

    if (!rates[from] || !rates[to]) return;

    const amt = Number(leftAmount);
    if (Number.isNaN(amt)) return;

    const usd = amt / Number(rates[from]);
    const finalValue = usd * Number(rates[to]);
    setRightAmount(finalValue.toFixed(2));
  }, [leftAmount, from, to, rates]);

  const getCurrencyName = (code: string) => CURRENCY_NAMES[code] ?? code;

  return (
    <div className="w-full mt-5">
      <div className="pl-4 md:pl-10">
        <Card
          size="lg"
          className="w-[720px] bg-white rounded-xl shadow-md px-6 py-5"
        >
          {/* EVERYTHING BELOW IS EXACTLY THE SAME AS BEFORE */}
          <div className="flex items-start justify-start gap-6 ">
            <div className="flex flex-col items-center gap-7">
              <div className="flex items-center w-full">
                {/* Fixed-width text box */}
                <div className="w-[200px] text-sm font-medium text-gray-700 truncate">
                  {getCurrencyName(from)}
                </div>
                <div>
                  <CurrencyDropdown
                    value={from}
                    onChange={setFrom}
                    options={currencies}
                    className="currency-select"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 -translate-x-16">
                <AmountInput
                  value={leftAmount}
                  onChange={handleLeftChange}
                  disabled={loading}
                  placeholder="Enter amount"
                />

                <span className="leading-[1.2] pt-1 text-base text-gray-600">
                  {getFlagEmoji(from)}
                </span>
              </div>
            </div>

            <div className="relative flex items-center justify-center pt-18 -translate-x-5">
              {/* Vertical line */}
              <Divider
                orientation="vertical"
                length="70px"
                thickness="1px"
                color="bg-gray-700"
                className="absolute"
              />

              <button
                type="button"
                onClick={swapCurrencies}
                aria-label="Swap currencies"
                className="text-lg font-semibold text-gray-700 -translate-y-18.5"
              >
                ⇆
              </button>
            </div>

            <div className="flex flex-col items-center gap-7 -translate-x-6">
              <div className="flex items-center w-full">
                {/* Fixed-width text box */}
                <div className="w-[200px] text-sm font-medium text-gray-700 truncate">
                  {getCurrencyName(to)}
                </div>
                <div>
                  <CurrencyDropdown
                    value={to}
                    onChange={setTo}
                    options={currencies}
                    className="currency-select"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 -translate-x-16">
                <AmountInput
                  value={rightAmount}
                  onChange={handleRightChange}
                  disabled={loading}
                  placeholder="Converted amount"
                />
                <span className="text-base leading-[1.2] pt-1 text-gray-700">
                  {getFlagEmoji(to)}
                </span>
              </div>
            </div>
          </div>
          <RateInfo from={from} to={to} rates={rates} className="mt-4" />
        </Card>
      </div>
    </div>
  );
}
