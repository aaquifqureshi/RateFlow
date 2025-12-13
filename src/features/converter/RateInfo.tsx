import { useRate } from "../../components/useRate";

type Props = {
  from: string;
  to: string;
  rates: Record<string, number>;
  className?: string;
};

function getFlag(code: string) {
  if (!code) return "";
  const country = code.slice(0, 3).toUpperCase();
  return country.replace(/./g, (char) =>
    String.fromCodePoint(127397 + char.charCodeAt(0))
  );
}

export default function RateInfo({ from, to, rates, className = "" }: Props) {
  const { percent } = useRate(from, to);

  const fromRate = rates[from];
  const toRate = rates[to];

  if (!fromRate || !toRate) {
    return (
      <p className={`text-sm font-medium text-gray-700 ${className}`}>
        Rate info not available
      </p>
    );
  }

  // convert 1 unit via USD base
  const oneInUSD = 1 / Number(fromRate);
  const oneTo = oneInUSD * Number(toRate);
  const inverse = 1 / oneTo;

  return (
    <div className={`text-sm font-medium text-gray-700 mt-4 ${className}`}>
      <div className="font-medium flex items-center gap-2">
        <span>
          1 {getFlag(to)} = {inverse.toFixed(4)} {getFlag(from)}
        </span>

        {percent !== null && (
          <span className="text-xs text-gray-500">
            {percent > 0 ? "↑" : "↓"} {Math.abs(percent).toFixed(2)}% today
          </span>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-1">
        Based on latest exchange rates
      </p>
    </div>
  );
}
