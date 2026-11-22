import { useEffect, useRef } from 'react';
import { Eye, Edit3, Copy, Trash2 } from 'lucide-react';

interface RowContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export function RowContextMenu({
  x,
  y,
  onClose,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: RowContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust positioning so menu doesn't overflow screen
  const menuStyle = {
    top: Math.min(y, window.innerHeight - 170),
    left: Math.min(x, window.innerWidth - 180),
  };

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className="fixed z-50 min-w-[160px] rounded-lg border border-slate-200 bg-white p-1 text-slate-700 shadow-xl text-xs select-none animate-in fade-in zoom-in-95 duration-100"
    >
      {onView && (
        <button
          onClick={() => {
            onView();
            onClose();
          }}
          className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <Eye className="h-3.5 w-3.5 text-slate-500" />
          <span>View Details</span>
        </button>
      )}

      {onEdit && (
        <button
          onClick={() => {
            onEdit();
            onClose();
          }}
          className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <Edit3 className="h-3.5 w-3.5 text-blue-500" />
          <span>Edit Record</span>
        </button>
      )}

      {onDuplicate && (
        <button
          onClick={() => {
            onDuplicate();
            onClose();
          }}
          className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <Copy className="h-3.5 w-3.5 text-purple-500" />
          <span>Duplicate</span>
        </button>
      )}

      {onDelete && (
        <>
          <div className="my-1 h-px bg-slate-100" />
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 hover:bg-rose-50 text-rose-600 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        </>
      )}
    </div>
  );
}
