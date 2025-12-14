import Card from "../../components/Card";
import { CURRENCY_NAMES } from "../converter/currencyName";
import { DifferenceLiveRate } from "./DifferenceLiveRate";

type Props = {
  base: string;
  code: string;
  rate: number | null;
  onSelect: (code: string) => void;
};

export default function LiveRateCard({ base, code, rate, onSelect }: Props) {
  return (
    <Card
      as="article"
      size="md"
      clickable
      onClick={() => onSelect(code)}
      className="flex flex-col justify-between w-42.5 h-30"
    >
      {" "}
      <div className="text-sm">
        <span className="font-semibold">{code}</span>{" "}
        <span className="text-gray-600">
          {CURRENCY_NAMES[code as keyof typeof CURRENCY_NAMES] ?? "—"}
        </span>
      </div>
      <div className="text-gray-700">
        <span className="text-lg font-semibold">1</span>{" "}
        <span className="text-xs">{base} = </span>
        <span className="text-lg font-semibold">
          {rate !== null ? rate.toFixed(2) : "—"}
        </span>{" "}
        <span className="text-xs">{code}</span>
      </div>
      <div className="pt-1 text-sm">
        <DifferenceLiveRate base={base} target={code} />
      </div>
    </Card>
  );
}
