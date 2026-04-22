'use client';

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type PaginationState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  isLoading?: boolean;
  searchKey?: string;
  searchPlaceholder?: string;

  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: (state: PaginationState) => void;

  sorting?: SortingState;
  onSortingChange?: (state: SortingState) => void;

  onRowClick?: (row: TData) => void;
  getRowId?: (row: TData) => string;

  toolbar?: React.ReactNode;
  enableRowSelection?: boolean;
  onRowSelectionChange?: (selection: Record<string, boolean>) => void;

  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  searchKey,
  searchPlaceholder = 'Search...',
  pageCount,
  pagination: controlledPagination,
  onPaginationChange,
  sorting: controlledSorting,
  onSortingChange,
  onRowClick,
  getRowId,
  toolbar,
  enableRowSelection = false,
  onRowSelectionChange,
  className,
}: DataTableProps<TData, TValue>) {
  const [localSorting, setLocalSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [localPagination, setLocalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const isServerSide = pageCount !== undefined;
  const activeSorting = isServerSide ? controlledSorting ?? [] : localSorting;
  const activePagination = isServerSide
    ? controlledPagination ?? localPagination
    : localPagination;

  const table = useReactTable({
    data,
    columns,
    pageCount: isServerSide ? pageCount : undefined,
    state: {
      sorting: activeSorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: activePagination,
    },
    getRowId,
    enableRowSelection,
    onRowSelectionChange: (updater) => {
      setRowSelection((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        onRowSelectionChange?.(next);
        return next;
      });
    },
    onSortingChange: isServerSide
      ? (updater) => {
          const next =
            typeof updater === 'function' ? updater(activeSorting) : updater;
          onSortingChange?.(next);
        }
      : setLocalSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: isServerSide
      ? (updater) => {
          const next =
            typeof updater === 'function' ? updater(activePagination) : updater;
          onPaginationChange?.(next);
        }
      : setLocalPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: isServerSide ? undefined : getSortedRowModel(),
    getFilteredRowModel: isServerSide ? undefined : getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: isServerSide,
    manualSorting: isServerSide,
    manualFiltering: isServerSide,
  });

  const SKELETON_ROWS = activePagination.pageSize;

  return (
    <div className={cn('space-y-3', className)}>
      {toolbar && <div>{toolbar}</div>}

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs font-medium uppercase tracking-wide text-muted-foreground h-10"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : table.getRowModel().rows.length
                ? table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() ? 'selected' : undefined}
                      onClick={() => onRowClick?.(row.original)}
                      className={cn(onRowClick && 'cursor-pointer hover:bg-muted/50')}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3 text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-32 text-center text-muted-foreground text-sm"
                      >
                        No results found.
                      </TableCell>
                    </TableRow>
                  )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      {!isLoading && table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Page {activePagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                table.setPageIndex((old) => Math.max(0, old - 1))
              }
              disabled={!table.getCanPreviousPage()}
              className="px-2 py-1 text-sm border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() =>
                table.setPageIndex((old) =>
                  Math.min(table.getPageCount() - 1, old + 1)
                )
              }
              disabled={!table.getCanNextPage()}
              className="px-2 py-1 text-sm border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
