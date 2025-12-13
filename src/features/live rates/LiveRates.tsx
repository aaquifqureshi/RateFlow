import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import { CURRENCY_NAMES } from "../converter/currencyName";
import { DifferenceLiveRate } from "./DifferenceLiveRate";

type Rates = Record<string, number>;

const TOP_CURRENCIES = [
  "USD",
  "EUR",
  "JPY",
  "HKD",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "GBP",
  "NZD",
  "SGD",
  "INR",
  "DKK",
] as const;

interface Props {
  amount: number;
  base: string;
  existingRates?: Rates;
  apiKey?: string;
  limit?: number;
  onSelectCurrency: (currency: string) => void;
}

export default function LiveRates({
  amount,
  base,
  existingRates,
  apiKey,
  limit = TOP_CURRENCIES.length,
  onSelectCurrency,
}: Props) {
  const [rates, setRates] = useState<Rates>(existingRates ?? {});
  const [loading, setLoading] = useState<boolean>(!existingRates);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingRates) {
      setRates(existingRates);
      setLoading(false);
      setError(null);
      return;
    }

    if (!apiKey) {
      setError("No API key for rates.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch(
          `https://v6.exchangerate-api.com/v6/${encodeURIComponent(
            apiKey
          )}/latest/${encodeURIComponent(base)}`,
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error(`Rates fetch failed: ${res.status}`);

        const json = await res.json();
        if (!json?.conversion_rates) {
          throw new Error("Invalid rates response");
        }

        setRates(json.conversion_rates as Rates);
      } catch (err: unknown) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message ?? "Unknown error");
        setRates({});
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [existingRates, apiKey, base]);

  const comparisons = useMemo(() => {
    const candidates = TOP_CURRENCIES.filter((c) => c !== base);
    const list = candidates.slice(0, limit);

    return list
      .map((code) => {
        const rate = rates[code];

        if (typeof rate !== "number") {
          return { code, rate: null, converted: null };
        }

        return {
          code,
          rate, // already per-base
          converted: rate * amount,
        };
      })
      .sort((a, b) => {
        if (a.converted === null) return 1;
        if (b.converted === null) return -1;
        return b.converted - a.converted;
      });
  }, [rates, base, amount, limit]);

  return (
    <section aria-label="Live top currency comparisons" className="mt-5">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm font-medium text-gray-700">Live Compare</h4>
        <div className="text-xs text-gray-500">
          Base Amount: {amount} {base}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && (
          <div className="col-span-full text-sm text-gray-500">
            Loading live rates…
          </div>
        )}

        {error && (
          <div className="col-span-full text-sm text-red-600">
            Error: {error}
          </div>
        )}

        {!loading &&
          !error &&
          comparisons.map(({ code, rate }) => (
            <Card
              key={code}
              as="article"
              size="md"
              clickable
              onClick={() => onSelectCurrency(code)}
              className="flex flex-col justify-between w-[170px] h-[120px]"
              aria-label={`Convert ${base} to ${code}`}
            >
              {/* ROW 1 */}
              <div className="text-sm">
                <span className="font-semibold">{code}</span>{" "}
                <span className="text-gray-600">
                  {CURRENCY_NAMES[code as keyof typeof CURRENCY_NAMES] ?? "—"}
                </span>
              </div>

              {/* ROW 2 */}
              <div className=" text-gray-700">
                <span className="text-lg font-semibold">1</span>{" "}
                <span className="text-xs">{base} = </span>
                <span className="text-lg font-semibold">
                  {rate !== null ? rate.toFixed(2) : "—"}
                </span>{" "}
                <span className="text-xs">{code}</span>
              </div>

              {/* ROW 3 */}
              <div className="pt-1 text-sm">
                <DifferenceLiveRate base={base} target={code} />
              </div>
            </Card>
          ))}
      </div>
    </section>
  );
}
