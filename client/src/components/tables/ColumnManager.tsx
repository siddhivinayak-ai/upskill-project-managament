import { useState } from 'react';
import { Columns3, Check, RotateCcw, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T | string;
  cell?: (info: { row: T; value: any }) => React.ReactNode;
  width?: number;
  sortable?: boolean;
}

interface ColumnManagerProps<T> {
  columns: ColumnDef<T>[];
  visibleColumnIds: string[];
  onChangeVisibleColumnIds: (ids: string[]) => void;
  columnOrder: string[];
  onChangeColumnOrder: (order: string[]) => void;
  onReset: () => void;
}

export function ColumnManager<T>({
  columns,
  visibleColumnIds,
  onChangeVisibleColumnIds,
  columnOrder,
  onChangeColumnOrder,
  onReset,
}: ColumnManagerProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  // Reconcile order with available columns
  const orderedColumns = columnOrder
    .map(id => columns.find(c => c.id === id))
    .filter((c): c is ColumnDef<T> => Boolean(c));

  // Add any columns not in columnOrder
  columns.forEach(col => {
    if (!orderedColumns.some(c => c.id === col.id)) {
      orderedColumns.push(col);
    }
  });

  const toggleColumn = (id: string) => {
    if (visibleColumnIds.includes(id)) {
      // Don't allow hiding all columns
      if (visibleColumnIds.length <= 1) return;
      onChangeVisibleColumnIds(visibleColumnIds.filter(c => c !== id));
    } else {
      onChangeVisibleColumnIds([...visibleColumnIds, id]);
    }
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...orderedColumns.map(c => c.id)];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;
    onChangeColumnOrder(newOrder);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-1.5 text-xs text-slate-700 font-normal"
        title="Customize columns"
      >
        <Columns3 className="h-3.5 w-3.5 text-slate-500" />
        <span>Columns ({visibleColumnIds.length}/{columns.length})</span>
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 w-72 rounded-lg border border-slate-200 bg-white p-3 shadow-xl z-50 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <span className="font-semibold text-slate-900">Custom Columns</span>
              <button
                onClick={onReset}
                className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700"
                title="Reset to default columns"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mb-2">
              Toggle visibility or reorder columns to personalize your table view.
            </p>

            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
              {orderedColumns.map((col, idx) => {
                const isVisible = visibleColumnIds.includes(col.id);
                return (
                  <div
                    key={col.id}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 group border border-transparent hover:border-slate-100 transition-colors"
                  >
                    <label className="flex items-center gap-2 cursor-pointer select-none flex-1 truncate">
                      <div
                        onClick={() => toggleColumn(col.id)}
                        className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                          isVisible
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isVisible && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <span className={`truncate ${isVisible ? 'font-medium text-slate-800' : 'text-slate-400'}`}>
                        {col.header}
                      </span>
                    </label>

                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        disabled={idx === 0}
                        onClick={() => moveColumn(idx, 'up')}
                        className="p-1 hover:bg-slate-200 rounded disabled:opacity-30 text-slate-600"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        disabled={idx === orderedColumns.length - 1}
                        onClick={() => moveColumn(idx, 'down')}
                        className="p-1 hover:bg-slate-200 rounded disabled:opacity-30 text-slate-600"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
