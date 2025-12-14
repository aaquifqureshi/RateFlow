import { useEffect, useMemo, useState } from "react";
import { TOP_CURRENCIES } from "./constants";

type Rates = Record<string, number>;

export function useLiveRates({
  amount,
  base,
  existingRates,
  apiKey,
  limit,
}: {
  amount: number;
  base: string;
  existingRates?: Rates;
  apiKey?: string;
  limit: number;
}) {
  const [rates, setRates] = useState<Rates>(existingRates ?? {});
  const [loading, setLoading] = useState(!existingRates);
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
          `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`,
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error(`Rates fetch failed`);

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
    return TOP_CURRENCIES.filter((c) => c !== base)
      .slice(0, limit)
      .map((code) => {
        const rate = rates[code];
        return {
          code,
          rate: typeof rate === "number" ? rate : null,
          converted: typeof rate === "number" ? rate * amount : null,
        };
      })
      .sort((a, b) => {
        if (a.converted === null) return 1;
        if (b.converted === null) return -1;
        return b.converted - a.converted;
      });
  }, [rates, base, amount, limit]);

  return { comparisons, loading, error };
}
