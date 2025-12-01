import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/config/axios-config";
import { config } from "@/config/config";
import { useAuth } from "@/context/auth-context";
import { SearchResult } from "../types";

export function useUserSearch(competitionId: string) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["user-search", competitionId, searchTerm],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${config.server}/api/players/basic`,
        {
          params: {
            userId: user?.id,
            competitionId: competitionId,
            query: searchTerm,
          },
          withCredentials: true,
        },
      );
      return response.data as SearchResult[];
    },
    enabled: !!searchTerm.trim(),
  });

  const triggerSearch = () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      setSearchTerm(trimmedQuery);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchTerm("");
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    triggerSearch,
    clearSearch,
    searchTerm,
  };
}
