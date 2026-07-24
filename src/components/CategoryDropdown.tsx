interface CategoryOption {
  category: string;
  threshold: number;
  rubric: string;
  template: string;
}

interface CategoryDropdownProps {
  categories: CategoryOption[];
  value: string;
  onChange: (value: string) => void;
}

export function CategoryDropdown({ categories, value, onChange }: CategoryDropdownProps) {
  return (
    <select className="form-input" value={value} onChange={(event) => onChange(event.target.value)}>
      {categories.map((category) => (
        <option key={category.category} value={category.category}>
          {category.category} · threshold {category.threshold}
        </option>
      ))}
    </select>
  );
}
