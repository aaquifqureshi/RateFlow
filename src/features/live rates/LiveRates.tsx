import { useLiveRates } from "./useLiveRates";
import { TOP_CURRENCIES } from "./constants";
import LiveRateCard from "./LiveRatesCard";

type Rates = Record<string, number>;

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
  const { comparisons, loading, error } = useLiveRates({
    amount,
    base,
    existingRates,
    apiKey,
    limit,
  });

  return (
    <section className="mt-5">
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
            <LiveRateCard
              key={code}
              base={base}
              code={code}
              rate={rate}
              onSelect={onSelectCurrency}
            />
          ))}
      </div>
    </section>
  );
}
