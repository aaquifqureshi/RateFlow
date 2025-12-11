type Props = {
  value: string;
  onChange: (code: string) => void;
  options: string[];
  className?: string;
};

export default function CurrencyDropdown({
  value,
  onChange,
  options,
  className = "",
}: Props) {
  return (
    <select
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((cur) => (
        <option key={cur} value={cur}>
          {cur}
        </option>
      ))}
    </select>
  );
}
