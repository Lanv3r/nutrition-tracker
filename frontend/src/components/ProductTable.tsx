import * as React from "react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/pages/Dashboard";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

type ProductTableProps = {
  data: Product[];
  onEditServing: (mealIds: number[], grams: number) => Promise<void> | void;
  onDeleteMeals: (mealIds: number[]) => Promise<void> | void;
};

export default function ProductTable({
  data,
  onEditServing,
  onDeleteMeals,
}: ProductTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [actionError, setActionError] = React.useState<string | null>(null);

  const columns = React.useMemo<ColumnDef<Product>[]>(() => {
    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Date
              <ArrowUpDown />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="lowercase">{row.getValue("createdAt")}</div>
        ),
      },
      {
        accessorKey: "servingSizeGrams",
        header: () => <div>Grams</div>,
        cell: ({ row }) => (
          <div className="font-medium">
            {parseFloat(row.getValue("servingSizeGrams"))}
          </div>
        ),
      },
      {
        accessorKey: "calories",
        header: () => <div>Calories</div>,
        cell: ({ row }) => (
          <div className="font-medium">
            {parseFloat(row.getValue("calories"))}
          </div>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const product = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={async () => {
                      const input = window.prompt(
                        "Enter new grams for this item",
                        `${product.servingSizeGrams}`,
                      );
                      if (input === null) return;
                      const grams = Number(input);
                      if (!Number.isFinite(grams) || grams <= 0) {
                        setActionError("Enter a valid grams value.");
                        return;
                      }
                      try {
                        setActionError(null);
                        await onEditServing([product.mealId], grams);
                      } catch (err) {
                        setActionError(
                          err instanceof Error ? err.message : "Edit failed",
                        );
                      }
                    }}
                  >
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={async () => {
                      const confirmed = window.confirm(
                        "Do you want to permanently delete 1 item?",
                      );
                      if (!confirmed) return;
                      try {
                        setActionError(null);
                        await onDeleteMeals([product.mealId]);
                      } catch (err) {
                        setActionError(
                          err instanceof Error ? err.message : "Delete failed",
                        );
                      }
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ];
  }, [onDeleteMeals, onEditServing]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedMealIds = selectedRows.map((row) => row.original.mealId);

  const handleEditSelected = async () => {
    if (!selectedMealIds.length) return;
    const input = window.prompt(
      `Enter new grams for ${selectedMealIds.length} item(s)`,
      "",
    );
    if (input === null) return;
    const grams = Number(input);
    if (!Number.isFinite(grams) || grams <= 0) {
      setActionError("Enter a valid grams value.");
      return;
    }
    try {
      setActionError(null);
      await onEditServing(selectedMealIds, grams);
      table.resetRowSelection();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Edit failed");
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedMealIds.length) return;
    const confirmed = window.confirm(
      `Do you want to permanently delete ${selectedMealIds.length} item(s)?`,
    );
    if (!confirmed) return;
    try {
      setActionError(null);
      await onDeleteMeals(selectedMealIds);
      table.resetRowSelection();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter products..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button
          variant="outline"
          className="ml-4"
          disabled={!selectedMealIds.length}
          onClick={handleEditSelected}
        >
          Edit grams
        </Button>
        <Button
          variant="destructive"
          className="ml-2"
          disabled={!selectedMealIds.length}
          onClick={handleDeleteSelected}
        >
          Delete
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {actionError && (
        <div className="mt-2 text-sm text-red-600">{actionError}</div>
      )}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
