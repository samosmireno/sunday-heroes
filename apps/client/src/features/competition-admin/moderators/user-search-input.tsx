import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

interface UserSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  disabled?: boolean;
}

export default function UserSearchInput({
  value,
  onChange,
  onSearch,
  isSearching,
  disabled = false,
}: UserSearchInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search by nickname..."
        className="flex-1 rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-2 text-gray-200 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        disabled={disabled}
      />
      <Button
        onClick={onSearch}
        disabled={isSearching || disabled || !value.trim()}
        className="rounded-lg border-2 border-accent/50 bg-accent/20 px-3 py-2 text-accent hover:bg-accent/30 disabled:opacity-50"
      >
        {isSearching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
