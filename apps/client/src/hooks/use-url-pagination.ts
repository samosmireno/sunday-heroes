import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface UseUrlPaginationOptions {
  paramName?: string;
  replace?: boolean;
}

export function useUrlPagination(options: UseUrlPaginationOptions = {}) {
  const { paramName = "page", replace = true } = options;
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const currentPage = Math.max(
    1,
    parseInt(searchParams.get(paramName) || "1", 10),
  );

  const setPage = useCallback(
    (page: number) => {
      const newSearchParams = new URLSearchParams(location.search);

      if (page === 1) {
        newSearchParams.delete(paramName);
      } else {
        newSearchParams.set(paramName, page.toString());
      }

      const newSearch = newSearchParams.toString();
      const newPath = `${location.pathname}${newSearch ? `?${newSearch}` : ""}`;

      navigate(newPath, { replace });
    },
    [location.pathname, location.search, navigate, paramName, replace],
  );

  const resetPage = useCallback(() => setPage(1), [setPage]);

  return {
    currentPage,
    setPage,
    resetPage,
  };
}
