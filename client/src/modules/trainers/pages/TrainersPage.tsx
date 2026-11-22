import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  Building2, 
  Layers, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  Sparkles,
  Award
} from 'lucide-react';
import { Trainer, SavedReport, FilterGroup } from '@/types';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/tables/DataTable';
import { ColumnDef } from '@/components/tables/ColumnManager';
import { FilterBuilder, FilterFieldDef } from '@/components/tables/FilterBuilder';
import { TrainerFormModal } from '../components/TrainerFormModal';
import { TrainerDetailDrawer } from '../components/TrainerDetailDrawer';
import { useToast } from '@/components/ui/Toast';
import { 
  getTrainers, 
  createTrainer, 
  updateTrainer, 
  duplicateTrainer, 
  deleteTrainer, 
  deleteTrainers,
  getSavedReports, 
  createSavedReport, 
  subscribeToStore,
  evaluateFilterGroups
} from '@/lib/mockStore';

export function TrainersPage() {
  const { success } = useToast();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);

  const loadData = async () => {
    const [fetchedTrainers, fetchedReports] = await Promise.all([
      getTrainers(),
      getSavedReports('trainers'),
    ]);
    setTrainers(fetchedTrainers);
    setSavedReports(fetchedReports);
  };

  useEffect(() => {
    loadData();
    const unsubTrainers = subscribeToStore('businessflow_trainers_v1', loadData);
    const unsubReports = subscribeToStore('businessflow_reports_v1', loadData);
    return () => {
      unsubTrainers();
      unsubReports();
    };
  }, []);

  // When active saved report changes, update filter groups
  const handleSelectReport = (reportId: string) => {
    setActiveReportId(reportId);
    if (!reportId) {
      setFilterGroups([]);
      return;
    }
    const report = savedReports.find(r => r.id === reportId);
    if (report && report.configuration.filterGroups) {
      setFilterGroups(report.configuration.filterGroups);
      success(`Loaded view: ${report.report_name}`);
    }
  };

  const handleSaveAsReport = async (reportName: string) => {
    await createSavedReport({
      report_name: reportName,
      source_table: 'trainers',
      configuration: {
        columns: ['trainer_name', 'company_name', 'location', 'experience', 'categories', 'status'],
        filterGroups,
      },
    });
    success(`Report "${reportName}" saved successfully`);
    loadData();
  };

  // KPI Calculations
  const totalTrainers = trainers.length;
  const activeTrainers = trainers.filter(t => t.status === 'Active').length;
  const uniqueCompanies = new Set(trainers.map(t => t.company_name).filter(Boolean)).size;
  const allCategories = new Set(trainers.flatMap(t => t.categories)).size;

  // Filtered trainers via FilterBuilder
  const filteredTrainers = useMemo(() => {
    return evaluateFilterGroups(trainers, filterGroups);
  }, [trainers, filterGroups]);

  // Filter Fields definition
  const filterFields: FilterFieldDef[] = [
    { key: 'trainer_name', label: 'Trainer Name', type: 'text' },
    { key: 'location', label: 'Location / City', type: 'text' },
    { key: 'company_name', label: 'Company / Firm', type: 'text' },
    { key: 'experience', label: 'Experience (Years)', type: 'number' },
    { key: 'categories', label: 'Category', type: 'array' },
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
      { value: 'Blacklisted', label: 'Blacklisted' },
    ]},
    { key: 'training_mode', label: 'Delivery Mode', type: 'array' },
  ];

  // Columns definition
  const columns: ColumnDef<Trainer>[] = [
    {
      id: 'trainer_name',
      header: 'Trainer Name',
      accessorKey: 'trainer_name',
      cell: ({ row }) => (
        <div className="flex flex-col min-w-[180px]">
          <span className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
            {row.trainer_name}
          </span>
          <span className="text-[11px] text-slate-500 truncate mt-0.5">
            {row.designation || 'Corporate Trainer'}
          </span>
        </div>
      ),
    },
    {
      id: 'company_name',
      header: 'Company / Organization',
      accessorKey: 'company_name',
      cell: ({ row }) => (
        <span className="font-medium text-slate-700 truncate max-w-[160px] block">
          {row.company_name || 'Independent'}
        </span>
      ),
    },
    {
      id: 'location',
      header: 'Location',
      accessorKey: 'location',
      width: 110,
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 text-slate-600">
          <MapPin className="h-3 w-3 text-slate-400" />
          {row.location}
        </span>
      ),
    },
    {
      id: 'experience',
      header: 'Experience',
      accessorKey: 'experience',
      width: 100,
      cell: ({ row }) => (
        <span className="font-semibold text-slate-800">
          {row.experience} yrs
        </span>
      ),
    },
    {
      id: 'categories',
      header: 'Categories',
      accessorKey: 'categories',
      sortable: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.categories.slice(0, 2).map(cat => (
            <span
              key={cat}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200"
            >
              {cat}
            </span>
          ))}
          {row.categories.length > 2 && (
            <span className="px-1 py-0.5 rounded text-[10px] text-slate-400 bg-slate-100">
              +{row.categories.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'training_mode',
      header: 'Mode',
      accessorKey: 'training_mode',
      width: 110,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.training_mode.map(m => (
            <span key={m} className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
              {m}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: 'contact',
      header: 'Contact',
      sortable: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-400" onClick={e => e.stopPropagation()}>
          {row.email && (
            <a href={`mailto:${row.email}`} title={row.email} className="hover:text-blue-600">
              <Mail className="h-3.5 w-3.5" />
            </a>
          )}
          {row.phone && (
            <a href={`tel:${row.phone}`} title={row.phone} className="hover:text-blue-600">
              <Phone className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      width: 100,
      cell: ({ row }) => <StatusBadge status={row.status} />,
    },
  ];

  const handleRowClick = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setIsDrawerOpen(true);
  };

  const handleEditTrainer = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setIsFormModalOpen(true);
  };

  const handleDuplicateTrainer = async (id: string) => {
    await duplicateTrainer(id);
    success('Trainer profile duplicated');
    loadData();
  };

  const handleDeleteTrainer = async (id: string) => {
    await deleteTrainer(id);
    success('Trainer profile deleted');
    loadData();
  };

  const handleBulkDelete = async (ids: string[]) => {
    await deleteTrainers(ids);
    success(`Deleted ${ids.length} trainers`);
    loadData();
  };

  const handleFormSubmit = async (formData: Partial<Trainer>) => {
    if (editingTrainer) {
      await updateTrainer(editingTrainer.id, formData);
      success('Trainer record updated');
    } else {
      await createTrainer(formData);
      success('New trainer added to master directory');
    }
    loadData();
    setEditingTrainer(null);
  };

  return (
    <PageLayout
      title="Trainers"
      description="Centralized trainer directory with advanced expertise search, company tracking, and custom reports."
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingTrainer(null);
            setIsFormModalOpen(true);
          }}
          className="gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Trainer</span>
        </Button>
      }
    >
      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 leading-none">{totalTrainers}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Total Trainers</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 leading-none">{activeTrainers}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Active for Deployment</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 leading-none">{uniqueCompanies}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Companies Represented</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 leading-none">{allCategories}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Training Categories</div>
          </div>
        </div>
      </div>

      {/* Saved Reports Chips / Quick Views */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs shrink-0">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1.5 mr-1">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" /> Saved Reports:
        </span>
        <button
          type="button"
          onClick={() => handleSelectReport('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
            activeReportId === null || activeReportId === ''
              ? 'bg-slate-900 text-white font-semibold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          All Master Trainers
        </button>

        {savedReports.map(rep => (
          <button
            key={rep.id}
            type="button"
            onClick={() => handleSelectReport(rep.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              activeReportId === rep.id
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {rep.report_name}
          </button>
        ))}
      </div>

      {/* Master Trainer Report Table */}
      <DataTable
        data={filteredTrainers}
        columns={columns}
        searchPlaceholder="Search trainers by name, expertise, location, company..."
        onRowClick={handleRowClick}
        onEditRow={handleEditTrainer}
        onDuplicateRow={t => handleDuplicateTrainer(t.id)}
        onDeleteRow={t => handleDeleteTrainer(t.id)}
        onBulkDelete={handleBulkDelete}
        exportFilename="trainers_master_report"
        defaultSort={{ field: 'experience', direction: 'desc' }}
        filterComponent={
          <FilterBuilder
            fields={filterFields}
            filterGroups={filterGroups}
            onChange={setFilterGroups}
            onSaveAsReport={handleSaveAsReport}
            savedReports={savedReports.map(r => ({ id: r.id, name: r.report_name }))}
            activeReportId={activeReportId}
            onSelectReport={handleSelectReport}
          />
        }
        emptyMessage="No trainers found matching the selected criteria. Try adjusting the filter conditions."
        emptyAction={{
          label: '+ Add Trainer',
          onClick: () => {
            setEditingTrainer(null);
            setIsFormModalOpen(true);
          },
        }}
      />

      {/* Detail Drawer */}
      <TrainerDetailDrawer
        trainer={selectedTrainer}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTrainer(null);
        }}
        onEdit={handleEditTrainer}
        onDuplicate={handleDuplicateTrainer}
        onDelete={handleDeleteTrainer}
      />

      {/* Create / Edit Modal */}
      <TrainerFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTrainer(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingTrainer}
      />
    </PageLayout>
  );
}
