import { useState, useEffect, useMemo } from 'react';
import { 
  FolderSync, 
  ExternalLink, 
  Plus, 
  Layers, 
  Building2, 
  FileSpreadsheet, 
  HardDrive
} from 'lucide-react';
import { DriveFolder, FilterGroup } from '@/types';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/tables/DataTable';
import { ColumnDef } from '@/components/tables/ColumnManager';
import { FilterBuilder, FilterFieldDef } from '@/components/tables/FilterBuilder';
import { DriveFormModal } from '../components/DriveFormModal';
import { DriveDetailDrawer } from '../components/DriveDetailDrawer';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { 
  getDriveFolders, 
  createDriveFolder, 
  updateDriveFolder, 
  deleteDriveFolder, 
  deleteDriveFolders,
  subscribeToStore,
  evaluateFilterGroups
} from '@/lib/mockStore';

export function DrivePage() {
  const { success } = useToast();
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<DriveFolder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<DriveFolder | null>(null);
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);

  const loadData = async () => {
    const fetched = await getDriveFolders();
    setFolders(fetched);
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToStore('businessflow_drive_v1', loadData);
    return unsub;
  }, []);

  // Filtered folders
  const filteredFolders = useMemo(() => {
    return evaluateFilterGroups(folders, filterGroups);
  }, [folders, filterGroups]);

  // KPIs
  const totalFolders = folders.length;
  const sharedDrivesCount = folders.filter(f => f.folder_type === 'Shared Drive').length;
  const masterSheetsCount = folders.filter(f => f.folder_type === 'Master Sheet').length;
  const uniqueDepartments = new Set(folders.map(f => f.department)).size;

  // Filter fields
  const filterFields: FilterFieldDef[] = [
    { key: 'folder_name', label: 'Folder Name', type: 'text' },
    { key: 'category', label: 'Category', type: 'select', options: [
      { value: 'Training Collateral', label: 'Training Collateral' },
      { value: 'Client Contracts', label: 'Client Contracts' },
      { value: 'Financial Reports', label: 'Financial Reports' },
      { value: 'SOPs & Guidelines', label: 'SOPs & Guidelines' },
      { value: 'Marketing Assets', label: 'Marketing Assets' },
      { value: 'Project Deliverables', label: 'Project Deliverables' },
    ]},
    { key: 'department', label: 'Department', type: 'select', options: [
      { value: 'Operations', label: 'Operations' },
      { value: 'Training & Delivery', label: 'Training & Delivery' },
      { value: 'Finance', label: 'Finance' },
      { value: 'Leadership', label: 'Leadership' },
      { value: 'Sales', label: 'Sales' },
    ]},
    { key: 'folder_type', label: 'Asset Type', type: 'select', options: [
      { value: 'Folder', label: 'Folder' },
      { value: 'Shared Drive', label: 'Shared Drive' },
      { value: 'Master Sheet', label: 'Master Sheet' },
      { value: 'Document', label: 'Document' },
    ]},
  ];

  // Table Columns
  const columns: ColumnDef<DriveFolder>[] = [
    {
      id: 'folder_name',
      header: 'Folder / Asset Name',
      accessorKey: 'folder_name',
      cell: ({ row }) => (
        <div className="flex flex-col min-w-[200px]">
          <span className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
            {row.folder_name}
          </span>
          {row.description && (
            <span className="text-[11px] text-slate-500 truncate max-w-sm mt-0.5">
              {row.description}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      accessorKey: 'category',
      cell: ({ row }) => (
        <span className="font-medium text-slate-700">{row.category}</span>
      ),
    },
    {
      id: 'department',
      header: 'Department',
      accessorKey: 'department',
      width: 140,
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
          <Building2 className="h-3 w-3 text-slate-400" />
          {row.department}
        </span>
      ),
    },
    {
      id: 'folder_type',
      header: 'Type',
      accessorKey: 'folder_type',
      width: 110,
      cell: ({ row }) => (
        <Badge
          variant={
            row.folder_type === 'Shared Drive'
              ? 'purple'
              : row.folder_type === 'Master Sheet'
              ? 'success'
              : 'slate'
          }
        >
          {row.folder_type}
        </Badge>
      ),
    },
    {
      id: 'drive_url',
      header: 'Google Drive',
      sortable: false,
      width: 120,
      cell: ({ row }) => (
        <div onClick={e => e.stopPropagation()}>
          <a
            href={row.drive_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors shadow-xs"
          >
            <span>Open Link</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      ),
    },
    {
      id: 'created_at',
      header: 'Registered',
      accessorKey: 'created_at',
      width: 110,
      cell: ({ row }) => <span>{formatDate(row.created_at)}</span>,
    },
  ];

  const handleRowClick = (folder: DriveFolder) => {
    setSelectedFolder(folder);
    setIsDrawerOpen(true);
  };

  const handleEditFolder = (folder: DriveFolder) => {
    setEditingFolder(folder);
    setIsFormModalOpen(true);
  };

  const handleDeleteFolder = async (folderId: string) => {
    await deleteDriveFolder(folderId);
    success('Drive asset removed from registry');
    loadData();
  };

  const handleBulkDelete = async (ids: string[]) => {
    await deleteDriveFolders(ids);
    success(`Removed ${ids.length} drive assets`);
    loadData();
  };

  const handleFormSubmit = async (formData: Partial<DriveFolder>) => {
    if (editingFolder) {
      await updateDriveFolder(editingFolder.id, formData);
      success('Drive asset record updated');
    } else {
      await createDriveFolder(formData);
      success('Drive asset registered successfully');
    }
    loadData();
    setEditingFolder(null);
  };

  return (
    <PageLayout
      title="Drive Registry"
      description="Centralized catalog of Google Drive folders, shared drives, and master documents with direct web links."
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingFolder(null);
            setIsFormModalOpen(true);
          }}
          className="gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Register Folder</span>
        </Button>
      }
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FolderSync className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 leading-none">{totalFolders}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Registered Folders</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 leading-none">{sharedDrivesCount}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Shared Drives</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 leading-none">{masterSheetsCount}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Master Trackers</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 leading-none">{uniqueDepartments}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Departments</div>
          </div>
        </div>
      </div>

      {/* Master Drive Report Table */}
      <DataTable
        data={filteredFolders}
        columns={columns}
        searchPlaceholder="Search drive assets by name, category, or department..."
        onRowClick={handleRowClick}
        onEditRow={handleEditFolder}
        onDeleteRow={t => handleDeleteFolder(t.id)}
        onBulkDelete={handleBulkDelete}
        exportFilename="drive_registry_export"
        filterComponent={
          <FilterBuilder
            fields={filterFields}
            filterGroups={filterGroups}
            onChange={setFilterGroups}
          />
        }
        emptyMessage="No Google Drive assets found matching your query."
        emptyAction={{
          label: '+ Register Folder',
          onClick: () => {
            setEditingFolder(null);
            setIsFormModalOpen(true);
          },
        }}
      />

      {/* Detail Drawer */}
      <DriveDetailDrawer
        folder={selectedFolder}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedFolder(null);
        }}
        onEdit={handleEditFolder}
        onDelete={handleDeleteFolder}
      />

      {/* Create / Edit Modal */}
      <DriveFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingFolder(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingFolder}
      />
    </PageLayout>
  );
}
