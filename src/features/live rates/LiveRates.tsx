import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";

type Rates = Record<string, number>;

const TOP10 = [
  "USD",
  "EUR",
  "JPY",
  "GBP",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "HKD",
  "SGD",
] as const;

interface Props {
  amount: number;
  base: string; // selected base currency (e.g., "INR")
  existingRates?: Rates; // rates object from App (all relative to same source, e.g., USD)
  apiKey?: string;
  limit?: number;
}

export default function LiveRates({
  amount,
  base,
  existingRates,
  apiKey,
  limit = TOP10.length,
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
        if (
          !json?.conversion_rates ||
          typeof json.conversion_rates !== "object"
        ) {
          throw new Error("Invalid rates response");
        }
        setRates(json.conversion_rates as Rates);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err?.message ?? "Unknown error");
        setRates({});
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [existingRates, apiKey, base]);

  // IMPORTANT: normalize rate if the provided `rates` are all relative to the same base (e.g., USD).
  // We compute targetPerBase = rates[target] / rates[base]
  const comparisons = useMemo(() => {
    const list = TOP10.slice(0, limit).filter((c) => c !== base);
    // if rates[base] exists and is a number, we can normalize; otherwise treat rates as direct
    const baseRate = rates[base];
    const canNormalize = typeof baseRate === "number" && baseRate !== 0;

    return list
      .map((code) => {
        const raw = rates[code]; // e.g., JPY per USD if your object is USD-based
        let ratePerBase: number | null = null;
        let converted: number | null = null;

        if (typeof raw === "number") {
          if (canNormalize) {
            // normalized rate = (target per USD) / (base per USD) = target per base
            ratePerBase = raw / baseRate;
          } else {
            // fallback: if we can't normalize, assume raw is already per-base
            ratePerBase = raw;
          }
          converted = ratePerBase * Number(amount);
        }

        return { code, rate: ratePerBase, converted };
      })
      .sort((a, b) => {
        if (a.converted === null) return 1;
        if (b.converted === null) return -1;
        return b.converted - a.converted;
      });
  }, [rates, base, amount, limit]);

  return (
    <section aria-label="Live top currency comparisons" className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">
          Live Compare (top {limit})
        </h4>
        <div className="text-xs text-gray-500">
          Base: {base} • Amount: {amount}
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
        {!loading && !error && comparisons.length === 0 && (
          <div className="col-span-full text-sm text-gray-500">
            No rates available.
          </div>
        )}

        {!loading &&
          !error &&
          comparisons.map(({ code, rate, converted }) => (
            <Card
              as="article"
              key={code}
              size="md"
              className="flex flex-col justify-between"
              aria-label={`Converted to ${code}`}
            >
              <div className="flex justify-between items-baseline">
                <h5 className="text-lg font-semibold">{code}</h5>
                <span className="text-xs text-gray-500">
                  Rate: {rate !== null ? Number(rate).toFixed(6) : "—"}
                </span>
              </div>

              <div className="mt-3 text-2xl font-bold">
                {converted !== null
                  ? converted.toLocaleString(undefined, {
                      maximumFractionDigits: 6,
                    })
                  : "—"}
              </div>

              <div className="mt-1 text-xs text-gray-400">Converted amount</div>
            </Card>
          ))}
      </div>
    </section>
  );
}
