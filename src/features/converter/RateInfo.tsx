type Props = {
  from: string;
  to: string;
  rates: Record<string, number>;
  className?: string;
};

function getFlag(code: string) {
  if (!code) return "";
  const country = code.slice(0, 2).toUpperCase();
  return country.replace(/./g, (char) =>
    String.fromCodePoint(127397 + char.charCodeAt(0))
  );
}

export default function RateInfo({ from, to, rates, className = "" }: Props) {
  if (!rates[from] || !rates[to]) {
    return (
      <p className={`text-gray-500 text-sm ${className}`}>
        Rate info not available
      </p>
    );
  }

  // convert 1 unit via USD base:
  const oneInUSD = 1 / Number(rates[from]);
  const oneTo = oneInUSD * Number(rates[to]);
  const inverse = 1 / oneTo;

  return (
    <div className={`text-gray-700 text-sm mt-4 ${className}`}>
      <p className="font-medium">
        {getFlag(from)} 1 {from} ={" "}
        <span className="font-semibold">{oneTo.toFixed(4)}</span> {to}{" "}
        {getFlag(to)}
      </p>

      <p className="font-medium">
        {getFlag(to)} 1 {to} ={" "}
        <span className="font-semibold">{inverse.toFixed(4)}</span> {from}{" "}
        {getFlag(from)}
      </p>

      <p className="text-xs text-gray-500 mt-1">
        Based on latest exchange rates
      </p>
    </div>
  );
}
