import { useState } from 'react';
import { 
  Calendar, 
  ListTodo, 
  ArrowRight, 
  ArrowLeft,
  Plus
} from 'lucide-react';
import { Task, TaskStatus, Employee } from '@/types';
import { PriorityBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { updateTask } from '@/lib/mockStore';

interface TaskKanbanViewProps {
  tasks: Task[];
  employees: Employee[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status?: TaskStatus) => void;
  onTaskUpdated: () => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'Not Started', label: 'Not Started', color: 'border-slate-300' },
  { id: 'In Progress', label: 'In Progress', color: 'border-blue-400' },
  { id: 'On Hold', label: 'On Hold', color: 'border-amber-400' },
  { id: 'Completed', label: 'Completed', color: 'border-emerald-400' },
];

export function TaskKanbanView({
  tasks,
  employees,
  onTaskClick,
  onAddTask,
  onTaskUpdated,
}: TaskKanbanViewProps) {
  const [movingTaskId, setMovingTaskId] = useState<string | null>(null);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    setMovingTaskId(taskId);
    await updateTask(taskId, {
      status: newStatus,
      progress: newStatus === 'Completed' ? 100 : undefined,
    });
    setMovingTaskId(null);
    onTaskUpdated();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start select-none">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-xl bg-slate-100/80 border border-slate-200/80 min-h-[500px]"
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between p-3 border-b-2 bg-white rounded-t-xl ${col.color}`}>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-slate-800">{col.label}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => onAddTask(col.id)}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                title={`Add task to ${col.label}`}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Column Cards */}
            <div className="p-2 space-y-2.5 flex-1 overflow-y-auto max-h-[75vh]">
              {colTasks.map(task => {
                const assignee = employees.find(e => e.id === task.assigned_to);

                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-2.5 group"
                  >
                    {/* Top Row: Category & Priority */}
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 truncate tracking-wide">
                        {task.category || 'General'}
                      </span>
                      <PriorityBadge priority={task.priority} />
                    </div>

                    {/* Task Title */}
                    <h4 className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {task.title}
                    </h4>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Progress</span>
                        <span className="font-medium text-slate-700">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer: Due date, Subtasks, Assignee */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        {task.due_date && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Calendar className="h-3 w-3" />
                            {formatDate(task.due_date)}
                          </span>
                        )}

                        {task.subtasks && task.subtasks.length > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-slate-400 font-medium">
                            <ListTodo className="h-3 w-3" />
                            {task.subtasks.filter(st => st.status === 'Completed').length}/{task.subtasks.length}
                          </span>
                        )}
                      </div>

                      {assignee && (
                        <div
                          className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ backgroundColor: assignee.color }}
                          title={`Assigned to ${assignee.name}`}
                        >
                          {assignee.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Quick Move Action buttons */}
                    <div className="flex items-center justify-between pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {col.id !== 'Not Started' && (
                        <button
                          disabled={movingTaskId === task.id}
                          onClick={e => {
                            const prevStatus: Record<TaskStatus, TaskStatus> = {
                              'In Progress': 'Not Started',
                              'On Hold': 'In Progress',
                              'Completed': 'In Progress',
                              'Not Started': 'Not Started',
                            };
                            handleStatusChange(task.id, prevStatus[col.id], e);
                          }}
                          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 font-medium"
                          title="Move Back"
                        >
                          <ArrowLeft className="h-2.5 w-2.5" />
                          <span>Back</span>
                        </button>
                      )}

                      <div className="flex-1" />

                      {col.id !== 'Completed' && (
                        <button
                          disabled={movingTaskId === task.id}
                          onClick={e => {
                            const nextStatus: Record<TaskStatus, TaskStatus> = {
                              'Not Started': 'In Progress',
                              'In Progress': 'Completed',
                              'On Hold': 'In Progress',
                              'Completed': 'Completed',
                            };
                            handleStatusChange(task.id, nextStatus[col.id], e);
                          }}
                          className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                          title="Advance"
                        >
                          <span>Advance</span>
                          <ArrowRight className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {colTasks.length === 0 && (
                <div className="py-8 text-center text-[11px] text-slate-400 italic">
                  No tasks in {col.label}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
