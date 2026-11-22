import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Table as TableIcon, 
  Kanban, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { Task, Employee, TaskStatus, FilterGroup } from '@/types';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/Button';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/tables/DataTable';
import { ColumnDef } from '@/components/tables/ColumnManager';
import { FilterBuilder, FilterFieldDef } from '@/components/tables/FilterBuilder';
import { TaskFormModal } from '../components/TaskFormModal';
import { TaskDetailDrawer } from '../components/TaskDetailDrawer';
import { TaskKanbanView } from '../components/TaskKanbanView';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { 
  getTasks, 
  getEmployees, 
  getCurrentUser, 
  createTask, 
  updateTask, 
  deleteTask, 
  deleteTasks, 
  bulkUpdateTaskStatus, 
  subscribeToStore,
  evaluateFilterGroups
} from '@/lib/mockStore';

type ViewTab = 'all' | 'my' | 'pending' | 'completed' | 'overdue' | 'kanban';

export function TasksPage() {
  const { success } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState<ViewTab>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [parentTaskIdForSubtask, setParentTaskIdForSubtask] = useState<string | null>(null);
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);

  const loadData = async () => {
    const [fetchedTasks, fetchedEmployees] = await Promise.all([
      getTasks(),
      getEmployees(),
    ]);
    setTasks(fetchedTasks);
    setEmployees(fetchedEmployees);
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToStore('businessflow_tasks_v1', loadData);
    return unsub;
  }, []);

  const currentUser = getCurrentUser();

  // Tab Filtering
  const tabFilteredTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    switch (activeTab) {
      case 'my':
        return tasks.filter(t => t.assigned_to === currentUser.id);
      case 'pending':
        return tasks.filter(t => t.status !== 'Completed');
      case 'completed':
        return tasks.filter(t => t.status === 'Completed');
      case 'overdue':
        return tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'Completed');
      case 'kanban':
      case 'all':
      default:
        return tasks;
    }
  }, [tasks, activeTab, currentUser.id]);

  // Apply custom FilterBuilder groups
  const finalFilteredTasks = useMemo(() => {
    return evaluateFilterGroups(tabFilteredTasks, filterGroups);
  }, [tabFilteredTasks, filterGroups]);

  // Filter fields configuration
  const filterFields: FilterFieldDef[] = [
    { key: 'title', label: 'Task Name', type: 'text' },
    { key: 'category', label: 'Category', type: 'select', options: [
      { value: 'Client Project', label: 'Client Project' },
      { value: 'Trainer Scouting', label: 'Trainer Scouting' },
      { value: 'Internal Ops', label: 'Internal Ops' },
      { value: 'Documentation', label: 'Documentation' },
      { value: 'Administrative', label: 'Administrative' },
    ]},
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'Not Started', label: 'Not Started' },
      { value: 'In Progress', label: 'In Progress' },
      { value: 'Completed', label: 'Completed' },
      { value: 'On Hold', label: 'On Hold' },
    ]},
    { key: 'priority', label: 'Priority', type: 'select', options: [
      { value: 'Low', label: 'Low' },
      { value: 'Medium', label: 'Medium' },
      { value: 'High', label: 'High' },
      { value: 'Urgent', label: 'Urgent' },
    ]},
    { key: 'progress', label: 'Progress (%)', type: 'number' },
  ];

  // Table Columns
  const columns: ColumnDef<Task>[] = [
    {
      id: 'title',
      header: 'Task Name',
      accessorKey: 'title',
      cell: ({ row }) => {
        const subtasksCount = row.subtasks?.length || 0;
        const completedSubtasks = row.subtasks?.filter(st => st.status === 'Completed').length || 0;

        return (
          <div className="flex flex-col min-w-[200px]">
            <span className="font-semibold text-slate-800 hover:text-blue-600 transition-colors">
              {row.title}
            </span>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
              <span>{row.project || 'General'}</span>
              {subtasksCount > 0 && (
                <>
                  <span>•</span>
                  <span className="text-slate-500 font-medium">
                    {completedSubtasks}/{subtasksCount} subtasks
                  </span>
                </>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      width: 120,
      cell: ({ row }) => <StatusBadge status={row.status} />,
    },
    {
      id: 'priority',
      header: 'Priority',
      accessorKey: 'priority',
      width: 100,
      cell: ({ row }) => <PriorityBadge priority={row.priority} />,
    },
    {
      id: 'assigned_to',
      header: 'Assigned To',
      accessorKey: 'assigned_to',
      cell: ({ row }) => {
        const emp = employees.find(e => e.id === row.assigned_to);
        if (!emp) return <span className="text-slate-400">Unassigned</span>;
        return (
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span
              className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
              style={{ backgroundColor: emp.color }}
            >
              {emp.name.charAt(0)}
            </span>
            <span className="truncate">{emp.name}</span>
          </div>
        );
      },
    },
    {
      id: 'start_date',
      header: 'Start Date',
      accessorKey: 'start_date',
      width: 100,
      cell: ({ row }) => <span>{formatDate(row.start_date)}</span>,
    },
    {
      id: 'due_date',
      header: 'Due Date',
      accessorKey: 'due_date',
      width: 100,
      cell: ({ row }) => {
        const today = new Date().toISOString().split('T')[0];
        const isOverdue = row.due_date && row.due_date < today && row.status !== 'Completed';

        return (
          <span className={isOverdue ? 'text-rose-600 font-semibold flex items-center gap-1' : ''}>
            {isOverdue && <AlertTriangle className="h-3 w-3" />}
            {formatDate(row.due_date)}
          </span>
        );
      },
    },
    {
      id: 'progress',
      header: 'Progress',
      accessorKey: 'progress',
      width: 130,
      cell: ({ row }) => (
        <div className="w-full space-y-1">
          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
            <span>{row.progress}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                row.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${row.progress}%` }}
            />
          </div>
        </div>
      ),
    },
  ];

  const handleRowClick = (task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    success('Task deleted successfully');
    loadData();
  };

  const handleBulkDelete = async (ids: string[]) => {
    await deleteTasks(ids);
    success(`Deleted ${ids.length} tasks`);
    loadData();
  };

  const handleBulkStatusChange = async (ids: string[], status: TaskStatus) => {
    await bulkUpdateTaskStatus(ids, status);
    success(`Updated ${ids.length} tasks to ${status}`);
    loadData();
  };

  const handleFormSubmit = async (formData: Partial<Task>) => {
    if (editingTask) {
      await updateTask(editingTask.id, formData);
      success('Task updated successfully');
    } else {
      await createTask(formData);
      success('Task created successfully');
    }
    loadData();
    setEditingTask(null);
    setParentTaskIdForSubtask(null);
  };

  const viewTabs: { id: ViewTab; label: string; icon: any; count?: number }[] = [
    { id: 'all', label: 'All Tasks', icon: TableIcon, count: tasks.length },
    {
      id: 'my',
      label: 'My Tasks',
      icon: UserCheck,
      count: tasks.filter(t => t.assigned_to === currentUser.id).length,
    },
    {
      id: 'pending',
      label: 'Pending',
      icon: Clock,
      count: tasks.filter(t => t.status !== 'Completed').length,
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: CheckCircle2,
      count: tasks.filter(t => t.status === 'Completed').length,
    },
    {
      id: 'overdue',
      label: 'Overdue',
      icon: AlertTriangle,
      count: tasks.filter(
        t => t.due_date && t.due_date < new Date().toISOString().split('T')[0] && t.status !== 'Completed'
      ).length,
    },
    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
  ];

  return (
    <PageLayout
      title="Tasks"
      description="Assign, track, organize, and monitor internal business activities."
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingTask(null);
            setParentTaskIdForSubtask(null);
            setIsFormModalOpen(true);
          }}
          className="gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </Button>
      }
    >
      {/* View Selector Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3 overflow-x-auto shrink-0">
        {viewTabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 bg-white border border-slate-200/60'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content: Table or Kanban */}
      {activeTab === 'kanban' ? (
        <TaskKanbanView
          tasks={finalFilteredTasks}
          employees={employees}
          onTaskClick={handleRowClick}
          onAddTask={status => {
            setEditingTask(null);
            setParentTaskIdForSubtask(null);
            setIsFormModalOpen(true);
          }}
          onTaskUpdated={loadData}
        />
      ) : (
        <DataTable
          data={finalFilteredTasks}
          columns={columns}
          searchPlaceholder="Search tasks by name, category, or project..."
          onRowClick={handleRowClick}
          onEditRow={handleEditTask}
          onDeleteRow={t => handleDeleteTask(t.id)}
          onBulkDelete={handleBulkDelete}
          exportFilename="tasks_export"
          filterComponent={
            <FilterBuilder
              fields={filterFields}
              filterGroups={filterGroups}
              onChange={setFilterGroups}
            />
          }
          bulkActions={
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusChange(tasks.map(t => t.id), 'Completed')}
                className="h-7 text-xs bg-white text-emerald-700 hover:bg-emerald-50 border-emerald-200"
              >
                Mark Completed
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusChange(tasks.map(t => t.id), 'In Progress')}
                className="h-7 text-xs bg-white text-blue-700 hover:bg-blue-50 border-blue-200"
              >
                Mark In Progress
              </Button>
            </div>
          }
          emptyMessage="No tasks found matching your criteria. Create a new task or adjust filters."
          emptyAction={{
            label: '+ Create Task',
            onClick: () => {
              setEditingTask(null);
              setIsFormModalOpen(true);
            },
          }}
        />
      )}

      {/* Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTask(null);
        }}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onTaskUpdated={loadData}
      />

      {/* Create / Edit Modal */}
      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTask(null);
          setParentTaskIdForSubtask(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
        parentTaskId={parentTaskIdForSubtask}
      />
    </PageLayout>
  );
}
