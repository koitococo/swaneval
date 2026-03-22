"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Table } from "@tanstack/react-table";

/** Props for react-table integration */
interface ReactTablePaginationProps<T> {
  table: Table<T>;
}

/** Props for standalone (simple) pagination */
interface SimplePaginationProps {
  page: number;
  pageCount: number;
  totalRows: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function TablePagination<T>(props: ReactTablePaginationProps<T> | SimplePaginationProps) {
  // Determine which mode
  if ("table" in props) {
    const { table } = props;
    const pageIndex = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();
    const totalRows = table.getFilteredRowModel().rows.length;
    if (totalRows <= table.getState().pagination.pageSize) return null;
    return (
      <PaginationBar
        page={pageIndex}
        pageCount={pageCount}
        totalRows={totalRows}
        pageSize={table.getState().pagination.pageSize}
        onPrev={() => table.previousPage()}
        onNext={() => table.nextPage()}
        canPrev={table.getCanPreviousPage()}
        canNext={table.getCanNextPage()}
      />
    );
  }

  const { page, pageCount, totalRows, pageSize, onPageChange } = props;
  if (totalRows <= pageSize) return null;
  return (
    <PaginationBar
      page={page}
      pageCount={pageCount}
      totalRows={totalRows}
      pageSize={pageSize}
      onPrev={() => onPageChange(page - 1)}
      onNext={() => onPageChange(page + 1)}
      canPrev={page > 0}
      canNext={page < pageCount - 1}
    />
  );
}

function PaginationBar({
  page,
  pageCount,
  totalRows,
  pageSize,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: {
  page: number;
  pageCount: number;
  totalRows: number;
  pageSize: number;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-2 py-3 border-t">
      <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={!canPrev} onClick={onPrev}>
        <ChevronLeft className="h-3.5 w-3.5" />
      </Button>
      <span className="text-xs text-muted-foreground px-2">
        <span className="font-semibold text-foreground tabular-nums">{page + 1}</span>
        {" / "}
        <span className="tabular-nums">{pageCount}</span>
        <span className="ml-2 text-muted-foreground/60">
          行 {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalRows)} / {totalRows}
        </span>
      </span>
      <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={!canNext} onClick={onNext}>
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
