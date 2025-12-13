type Props = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export default function AmountInput({
  value,
  onChange,
  placeholder = "Enter value",
  disabled = false,
  className = "",
}: Props) {
  return (
    <input
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      className={`block w-40 px-1 py-1 text-xl font-semibold tracking-tight border-b border-gray-300 bg-transparent 
        focus:outline-none focus:border-gray-600${className}`}
      disabled={disabled}
      value={value}
      onChange={(e) => {
        // Allow only digits, dot, and empty
        const raw = e.target.value;
        if (/^[0-9]*\.?[0-9]*$/.test(raw) || raw === "") {
          onChange(raw);
        }
      }}
    />
  );
}
