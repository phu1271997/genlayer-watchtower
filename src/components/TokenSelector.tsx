interface TokenSelectorProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function TokenSelector({ options, value, onChange }: TokenSelectorProps) {
  return (
    <select className="form-input" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
