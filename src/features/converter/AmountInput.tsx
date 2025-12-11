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
      className={`block w-full min-w-40 md:min-w-[200px] px-3 py-2 border rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500
                  ${className}`}
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
