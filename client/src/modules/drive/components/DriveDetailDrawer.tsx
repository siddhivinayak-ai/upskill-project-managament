import { 
  FolderSync, 
  ExternalLink, 
  Building2, 
  Tag, 
  FileText, 
  Edit3, 
  Trash2, 
  Calendar,
  Layers
} from 'lucide-react';
import { DriveFolder } from '@/types';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

interface DriveDetailDrawerProps {
  folder: DriveFolder | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (folder: DriveFolder) => void;
  onDelete: (folderId: string) => void;
}

export function DriveDetailDrawer({
  folder,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: DriveDetailDrawerProps) {
  if (!folder) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      width="lg"
      title={
        <div className="flex items-center gap-2">
          <Badge variant="default" size="sm">
            {folder.folder_type}
          </Badge>
          <Badge variant="slate" size="sm">
            {folder.department}
          </Badge>
        </div>
      }
      subtitle={
        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
          <span className="flex items-center gap-1">
            <Layers className="h-3 w-3" /> {folder.category}
          </span>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (confirm(`Remove "${folder.folder_name}" from Drive registry?`)) {
                onDelete(folder.id);
                onClose();
              }
            }}
            className="gap-1 text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onEdit(folder);
                onClose();
              }}
              className="gap-1 text-xs"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Asset</span>
            </Button>
          </div>
        </div>
      }
    >
      {/* Title & Description */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 leading-snug">{folder.folder_name}</h1>
        {folder.description && (
          <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
            {folder.description}
          </p>
        )}
      </div>

      {/* Primary Action: Direct Open in Google Drive */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2">
        <div className="text-xs font-semibold text-blue-900 flex items-center gap-2">
          <FolderSync className="h-4 w-4 text-blue-600" />
          <span>External Google Workspace Link</span>
        </div>
        <p className="text-[11px] text-blue-700 break-all font-mono bg-white p-2 rounded border border-blue-100">
          {folder.drive_url}
        </p>
        <a
          href={folder.drive_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors shadow-xs"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Open in Google Drive / Workspace</span>
        </a>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3 rounded-lg border border-slate-200">
        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Building2 className="h-3 w-3" /> Department
          </span>
          <div className="font-semibold text-slate-800">{folder.department}</div>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Calendar className="h-3 w-3" /> Registered On
          </span>
          <div className="font-semibold text-slate-800">{formatDate(folder.created_at)}</div>
        </div>
      </div>

      {/* Tags */}
      {folder.tags && folder.tags.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Tag className="h-3 w-3" /> Taxonomy Tags
          </span>
          <div className="flex flex-wrap gap-1.5">
            {folder.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {folder.notes && (
        <div className="space-y-1.5">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <FileText className="h-3 w-3" /> Access Guidelines & Notes
          </span>
          <p className="text-xs text-slate-700 bg-amber-50/60 p-3 rounded-lg border border-amber-200/60 leading-relaxed">
            {folder.notes}
          </p>
        </div>
      )}
    </Drawer>
  );
}
