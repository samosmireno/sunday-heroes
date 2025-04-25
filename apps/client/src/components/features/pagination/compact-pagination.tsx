import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../ui/pagination";

interface CompactPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function CompactPagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: CompactPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <Pagination className={className}>
      <PaginationContent className="gap-1 sm:gap-2">
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(currentPage - 1)}
              className="cursor-pointer border-2 border-accent/50 bg-bg/30 hover:bg-accent/10"
            />
          </PaginationItem>
        )}

        {Array.from({ length: Math.min(totalPages, 3) }).map((_, index) => {
          const pageNumber =
            currentPage > 2 ? currentPage - 1 + index : index + 1;
          if (pageNumber <= totalPages) {
            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  onClick={() => onPageChange(pageNumber)}
                  className={`h-8 w-8 cursor-pointer border-2 sm:h-9 sm:w-9 ${
                    currentPage === pageNumber
                      ? "border-accent bg-accent/20 text-accent"
                      : "border-accent/50 bg-bg/30 text-gray-300 hover:bg-accent/10"
                  }`}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          }
          return null;
        })}

        {totalPages > 3 && currentPage < totalPages - 1 && (
          <PaginationItem>
            <PaginationEllipsis className="text-accent" />
          </PaginationItem>
        )}

        {currentPage !== totalPages && totalPages > 3 && (
          <PaginationItem>
            <PaginationLink
              onClick={() => onPageChange(totalPages)}
              className="h-8 w-8 cursor-pointer border-2 border-accent/50 bg-bg/30 text-gray-300 hover:bg-accent/10 sm:h-9 sm:w-9"
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}

        {currentPage !== totalPages && (
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(currentPage + 1)}
              className="cursor-pointer border-2 border-accent/50 bg-bg/30 hover:bg-accent/10"
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
