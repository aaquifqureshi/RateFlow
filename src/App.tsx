import Converter from "./features/converter/Converter";
import Divider from "./components/Divider";

import { useEffect, useState } from "react";
import Header from "./features/header/Header";
import GraphDisplay from "./features/graph/GraphDisplay";
import LiveRates from "./features/live rates/LiveRates";

type Rates = Record<string, number>;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [rates, setRates] = useState<Rates>({});
  const [from, setFrom] = useState<string>("USD");
  const [to, setTo] = useState<string>("INR");
  const [amount, setAmount] = useState<number>(1); // <-- lifted amount state

  // prefer env var in production (Vite example)
  const API_KEY =
    import.meta.env.VITE_EXCHANGE_API_KEY ?? "e15400c3c6f00f5899b49026";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`
        );
        const data = await res.json();
        if (cancelled) return;

        const list = Object.keys(data.conversion_rates || {}).sort();
        setCurrencies(list);
        setRates(data.conversion_rates || {});
      } catch (err) {
        console.error("Currency fetch error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [API_KEY]);

  // Sync sensible defaults once currencies load (won't override user choices afterwards)
  useEffect(() => {
    if (!currencies.length) return;

    setFrom((prev) => (currencies.includes(prev) ? prev : currencies[0]));
    setTo((prev) =>
      currencies.includes(prev)
        ? prev
        : currencies.length > 1
        ? currencies[1]
        : currencies[0]
    );
  }, [currencies]);

  return (
    <>
      <Header />

      <main className="mt-2 bg-gray-50 min-h-[calc(100vh-40px)]">
        <div className="flex gap-7 items-start">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-5 w-[750px] shrink-0">
            <Converter
              currencies={currencies}
              rates={rates}
              loading={loading}
              from={from}
              to={to}
              setFrom={setFrom}
              setTo={setTo}
              amount={amount}
              setAmount={setAmount}
            />

            {/* Graph goes UNDER converter */}
            <GraphDisplay from={from} to={to} loading={loading} />
          </div>

          {/* Divider */}
          <Divider
            orientation="vertical"
            length="min(80vh)"
            thickness="1px"
            color="bg-gray-700"
            className="hidden md:block translate-y-10 translate-x-1"
          />

          {/* RIGHT COLUMN */}
          <div className="flex pr-5">
            <LiveRates
              amount={amount}
              base={from}
              existingRates={rates}
              apiKey={API_KEY}
              limit={12}
              onSelectCurrency={(currency) => setTo(currency)}
            />
          </div>
        </div>
      </main>
    </>
  );
}
