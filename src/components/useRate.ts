import { useEffect, useState } from "react";

export function useRate(base: string, target: string) {
  const [percent, setPercent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchDelta() {
      setLoading(true);

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 5);

      const url = `https://api.frankfurter.app/${start
        .toISOString()
        .slice(0, 10)}..${end
        .toISOString()
        .slice(0, 10)}?from=${base}&to=${target}`;

      try {
        const res = await fetch(url);
        const json = await res.json();
        const rates = json.rates as Record<string, Record<string, number>>;

        const dates = Object.keys(rates).sort();
        if (dates.length < 2) return;

        const prev = rates[dates[dates.length - 2]][target];
        const curr = rates[dates[dates.length - 1]][target];

        const deltaPct = ((curr - prev) / prev) * 100;

        if (!cancelled) setPercent(deltaPct);
      } catch {
        if (!cancelled) setPercent(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDelta();
    return () => {
      cancelled = true;
    };
  }, [base, target]);

  return { percent, loading };
}
