import { LayoutGrid, List, Search, X } from "lucide-react";
import { ViewType } from "../../../types/types";

interface SearchViewToggleProps {
  placeholder?: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewType: ViewType;
  onViewChange?: (viewType: ViewType) => void;
}

export function SearchViewToggle({
  placeholder = "Search...",
  searchQuery,
  onSearchChange,
  viewType,
  onViewChange,
}: SearchViewToggleProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-full flex-1 sm:max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3">
          <Search
            size={16}
            className="h-4 w-4 text-accent/70 sm:h-[18px] sm:w-[18px]"
          />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          className="w-full rounded-lg border-2 border-accent/50 bg-bg/30 py-1.5 pl-8 pr-8 text-sm text-gray-200 placeholder-gray-500 focus:border-accent focus:outline-none sm:py-2 sm:pl-10 sm:pr-9 sm:text-base"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-200 sm:pr-3"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
          >
            <X size={16} className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </button>
        )}
      </div>
      {onViewChange && (
        <div className="flex h-8 rounded-lg border-2 border-accent/50 bg-bg/20 p-1 sm:h-10">
          <button
            type="button"
            onClick={() => onViewChange(ViewType.GRID)}
            className={`flex items-center justify-center rounded px-2 transition-colors sm:px-3 ${
              viewType === ViewType.GRID
                ? "bg-accent/30 text-accent"
                : "text-gray-400 hover:bg-bg/40 hover:text-gray-300"
            }`}
            aria-label="Grid view"
            aria-pressed={viewType === ViewType.GRID}
          >
            <LayoutGrid
              size={16}
              className="h-4 w-4 sm:mr-2 sm:h-[18px] sm:w-[18px]"
            />
            <span className="hidden text-sm sm:inline">Grid</span>
          </button>
          <button
            type="button"
            onClick={() => onViewChange(ViewType.LIST)}
            className={`flex items-center justify-center rounded px-2 transition-colors sm:px-3 ${
              viewType === ViewType.LIST
                ? "bg-accent/30 text-accent"
                : "text-gray-400 hover:bg-bg/40 hover:text-gray-300"
            }`}
            aria-label="List view"
            aria-pressed={viewType === ViewType.LIST}
          >
            <List
              size={16}
              className="h-4 w-4 sm:mr-2 sm:h-[18px] sm:w-[18px]"
            />
            <span className="hidden text-sm sm:inline">List</span>
          </button>
        </div>
      )}
    </div>
  );
}
