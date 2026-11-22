import React, { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Download, 
  Trash2, 
  CheckSquare, 
  Layers,
  Inbox
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ColumnDef, ColumnManager } from './ColumnManager';
import { RowContextMenu } from './RowContextMenu';
import { exportToCsv } from '../../lib/utils';

export interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  onEditRow?: (row: T) => void;
  onDuplicateRow?: (row: T) => void;
  onDeleteRow?: (row: T) => void;
  onBulkDelete?: (ids: string[]) => void;
  bulkActions?: React.ReactNode;
  filterComponent?: React.ReactNode;
  exportFilename?: string;
  defaultSort?: { field: string; direction: 'asc' | 'desc' };
  emptyMessage?: string;
  emptyAction?: { label: string; onClick: () => void };
}

export function DataTable<T extends { id: string; [key: string]: any }>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  onRowClick,
  onEditRow,
  onDuplicateRow,
  onDeleteRow,
  onBulkDelete,
  bulkActions,
  filterComponent,
  exportFilename = 'records_export',
  defaultSort,
  emptyMessage = 'No records found matching your filters.',
  emptyAction,
}: DataTableProps<T>) {
  // State for search
  const [searchTerm, setSearchTerm] = useState('');

  // State for sorting
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(
    defaultSort || null
  );

  // State for selected rows
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // State for column visibility and order
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(columns.map(c => c.id));
  const [columnOrder, setColumnOrder] = useState<string[]>(columns.map(c => c.id));

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // State for context menu
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    row: T;
  } | null>(null);

  // Filtered & Searched Data
  const processedData = useMemo(() => {
    let result = [...data];

    // Search filter across text/array properties
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(item => {
        return Object.values(item).some(val => {
          if (val === null || val === undefined) return false;
          if (Array.isArray(val)) {
            return val.some(v => String(v).toLowerCase().includes(lower));
          }
          return String(val).toLowerCase().includes(lower);
        });
      });
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.field];
        const valB = b[sortConfig.field];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }

        const comp = String(valA).localeCompare(String(valB));
        return sortConfig.direction === 'asc' ? comp : -comp;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig]);

  // Paginated data
  const totalPages = Math.ceil(processedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Columns ordered and filtered
  const activeColumns = useMemo(() => {
    const orderMap = new Map(columnOrder.map((id, index) => [id, index]));
    return columns
      .filter(col => visibleColumnIds.includes(col.id))
      .sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999));
  }, [columns, visibleColumnIds, columnOrder]);

  const toggleSort = (field: string) => {
    setSortConfig(current => {
      if (current?.field === field) {
        if (current.direction === 'asc') return { field, direction: 'desc' };
        return null;
      }
      return { field, direction: 'asc' };
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(processedData.map(d => d.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExportCsv = () => {
    const exportColumns = activeColumns.map(col => ({
      key: (col.accessorKey as string) || col.id,
      label: col.header,
    }));
    exportToCsv(exportFilename, processedData, exportColumns);
  };

  const isAllSelected = processedData.length > 0 && selectedIds.size === processedData.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < processedData.length;

  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white shadow-xs">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 border-b border-slate-200 bg-white rounded-t-lg">
        {/* Left: Search input */}
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Input
            icon={<Search className="h-3.5 w-3.5" />}
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="h-8 text-xs bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>

        {/* Right: Actions, Filters, Columns, Export */}
        <div className="flex items-center gap-2 flex-wrap">
          {filterComponent}

          <ColumnManager
            columns={columns}
            visibleColumnIds={visibleColumnIds}
            onChangeVisibleColumnIds={setVisibleColumnIds}
            columnOrder={columnOrder}
            onChangeColumnOrder={setColumnOrder}
            onReset={() => {
              setVisibleColumnIds(columns.map(c => c.id));
              setColumnOrder(columns.map(c => c.id));
            }}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="gap-1.5 text-xs text-slate-700 font-normal"
            title="Export CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Bulk Action Banner */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-blue-50/90 border-b border-blue-200 text-xs text-blue-900 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-medium">
            <CheckSquare className="h-4 w-4 text-blue-600" />
            <span>{selectedIds.size} row{selectedIds.size > 1 ? 's' : ''} selected</span>
          </div>

          <div className="flex items-center gap-2">
            {bulkActions}

            {onBulkDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${selectedIds.size} selected records?`)) {
                    onBulkDelete(Array.from(selectedIds));
                    setSelectedIds(new Set());
                  }
                }}
                className="h-7 text-xs gap-1"
              >
                <Trash2 className="h-3 w-3" />
                <span>Delete Selected</span>
              </Button>
            )}

            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-blue-700 hover:underline px-1"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold text-[11px] tracking-wider select-none">
              {/* Checkbox column */}
              <th className="w-10 px-3 py-2.5 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={el => {
                    if (el) el.indeterminate = isSomeSelected;
                  }}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer h-3.5 w-3.5"
                />
              </th>

              {/* Data Columns */}
              {activeColumns.map(col => {
                const isSorted = sortConfig?.field === (col.accessorKey || col.id);
                const sortDir = isSorted ? sortConfig.direction : null;

                return (
                  <th
                    key={col.id}
                    onClick={() => col.sortable !== false && toggleSort((col.accessorKey as string) || col.id)}
                    className={`px-3.5 py-2.5 font-semibold transition-colors ${
                      col.sortable !== false ? 'cursor-pointer hover:bg-slate-100 hover:text-slate-900' : ''
                    }`}
                    style={{ width: col.width }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{col.header}</span>
                      {col.sortable !== false && (
                        <span className="text-slate-400">
                          {sortDir === 'asc' ? (
                            <ChevronUp className="h-3.5 w-3.5 text-blue-600 stroke-[2.5]" />
                          ) : sortDir === 'desc' ? (
                            <ChevronDown className="h-3.5 w-3.5 text-blue-600 stroke-[2.5]" />
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={activeColumns.length + 1} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Inbox className="h-5 w-5" />
                    </div>
                    <p className="text-xs text-slate-500 max-w-sm">{emptyMessage}</p>
                    {emptyAction && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={emptyAction.onClick}
                        className="mt-2 text-xs"
                      >
                        {emptyAction.label}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const isSelected = selectedIds.has(row.id);

                return (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick && onRowClick(row)}
                    onContextMenu={e => {
                      e.preventDefault();
                      setContextMenu({
                        x: e.clientX,
                        y: e.clientY,
                        row,
                      });
                    }}
                    className={`group transition-colors ${
                      isSelected
                        ? 'bg-blue-50/50 hover:bg-blue-50'
                        : 'hover:bg-slate-50/80'
                    } ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="w-10 px-3 py-2 text-center" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e => toggleSelectRow(row.id, e as any)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer h-3.5 w-3.5"
                      />
                    </td>

                    {/* Cell values */}
                    {activeColumns.map(col => {
                      const key = (col.accessorKey as string) || col.id;
                      const val = row[key];

                      return (
                        <td key={col.id} className="px-3.5 py-2.5 max-w-xs truncate">
                          {col.cell ? col.cell({ row, value: val }) : (
                            <span className="truncate">{val !== undefined && val !== null ? String(val) : '—'}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/60 rounded-b-lg text-xs text-slate-500 select-none">
        {/* Record count info */}
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-800">
            {processedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-800">
            {Math.min(currentPage * pageSize, processedData.length)}
          </span>{' '}
          of <span className="font-semibold text-slate-800">{processedData.length}</span> records
        </div>

        {/* Page navigation & Rows per page */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-7 text-xs rounded border border-slate-300 bg-white px-1.5 py-0.5 text-slate-700"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="mr-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="h-7 w-7"
              title="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="h-7 w-7"
              title="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Click Context Menu */}
      {contextMenu && (
        <RowContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onView={onRowClick ? () => onRowClick(contextMenu.row) : undefined}
          onEdit={onEditRow ? () => onEditRow(contextMenu.row) : undefined}
          onDuplicate={onDuplicateRow ? () => onDuplicateRow(contextMenu.row) : undefined}
          onDelete={onDeleteRow ? () => onDeleteRow(contextMenu.row) : undefined}
        />
      )}
    </div>
  );
}
