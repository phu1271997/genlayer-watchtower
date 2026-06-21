interface CategoryOption {
  category: string;
  threshold: number;
  rubric: string;
  template: string;
}

interface CategoryAdminPanelProps {
  categories: CategoryOption[];
}

export function CategoryAdminPanel({ categories }: CategoryAdminPanelProps) {
  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {categories.map((category) => (
        <div key={category.category} className="audit-node node-warning">
          <div className="audit-meta">
            <span className="audit-verdict warning">{category.category}</span>
            <span className="audit-reporter">Default threshold {category.threshold}</span>
          </div>
          <div className="audit-reasoning">{category.rubric}</div>
        </div>
      ))}
    </div>
  );
}
