import { Button } from "@/components/ui/button";

interface FilterOption<T> {
  value: T;
  label: string;
  color?: string;
}

interface FilterTabsProps<T> {
  options: FilterOption<T>[];
  activeFilter: T;
  onFilterChange: (filter: T) => void;
  className?: string;
}

export default function FilterTabs<T>({
  options,
  activeFilter,
  onFilterChange,
  className = "",
}: FilterTabsProps<T>) {
  return (
    <div
      className={`flex space-x-1.5 overflow-x-auto sm:space-x-2 ${className}`}
    >
      {options.map((option) => (
        <Button
          key={option.label}
          className={`whitespace-nowrap rounded border-2 px-2 py-1 text-sm font-medium sm:px-3 sm:py-1.5 sm:text-sm ${
            activeFilter === option.value
              ? option.color || "border-accent bg-accent/20 text-accent"
              : "border-accent/30 bg-bg/30 text-gray-300 hover:bg-accent/10"
          }`}
          onClick={() => onFilterChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
