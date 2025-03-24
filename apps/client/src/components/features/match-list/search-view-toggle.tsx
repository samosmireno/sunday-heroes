import { Search } from "lucide-react";
import { ViewType } from "../../../types/types";

interface SearchViewToggleProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewType: ViewType;
  onViewChange: (viewType: ViewType) => void;
}

export function SearchViewToggle({
  searchQuery,
  onSearchChange,
  viewType,
  onViewChange,
}: SearchViewToggleProps) {
  return (
    <div className="border-b p-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex w-full items-center rounded-lg bg-gray-100 px-3 py-2 md:w-64">
          <Search size={18} className="mr-2 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 border-none bg-transparent text-sm focus:outline-none"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            className={`rounded-lg px-3 py-2 text-sm ${
              viewType === ViewType.GRID
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => onViewChange(ViewType.GRID)}
          >
            Grid View
          </button>
          <button
            className={`rounded-lg px-3 py-2 text-sm ${
              viewType === ViewType.LIST
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => onViewChange(ViewType.LIST)}
          >
            List View
          </button>
        </div>
      </div>
    </div>
  );
}
