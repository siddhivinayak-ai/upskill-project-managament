import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  User, 
  Tag, 
  FileText, 
  MessageSquare, 
  Plus, 
  Send, 
  Edit3, 
  Trash2,
  ListTodo
} from 'lucide-react';
import { Task, TaskComment, Employee } from '@/types';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { formatDate, formatDateTime } from '@/lib/utils';
import { 
  getEmployees, 
  getTaskComments, 
  addTaskComment, 
  createTask, 
  updateTask 
} from '@/lib/mockStore';

interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onTaskUpdated?: () => void;
}

export function TaskDetailDrawer({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onTaskUpdated,
}: TaskDetailDrawerProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);

  useEffect(() => {
    getEmployees().then(setEmployees);
  }, []);

  useEffect(() => {
    if (task?.id) {
      getTaskComments(task.id).then(setComments);
    }
  }, [task?.id]);

  if (!task) return null;

  const assignee = employees.find(e => e.id === task.assigned_to);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !task) return;
    const comment = await addTaskComment(task.id, newComment.trim());
    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !task) return;

    await createTask({
      title: newSubtaskTitle.trim(),
      parent_task_id: task.id,
      category: task.category,
      project: task.project,
      assigned_to: task.assigned_to,
      priority: task.priority,
      status: 'Not Started',
      progress: 0,
    });

    setNewSubtaskTitle('');
    setShowSubtaskInput(false);
    onTaskUpdated?.();
  };

  const handleToggleSubtask = async (st: Task) => {
    const newStatus = st.status === 'Completed' ? 'Not Started' : 'Completed';
    await updateTask(st.id, {
      status: newStatus,
      progress: newStatus === 'Completed' ? 100 : 0,
    });
    onTaskUpdated?.();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      width="xl"
      title={
        <div className="flex items-center gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
      }
      subtitle={
        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
          <span>Project: {task.project || 'General'}</span>
          <span>•</span>
          <span>Category: {task.category || 'General'}</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (confirm('Are you sure you want to delete this task?')) {
                onDelete(task.id);
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
                onEdit(task);
                onClose();
              }}
              className="gap-1 text-xs"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Task</span>
            </Button>
          </div>
        </div>
      }
    >
      {/* Title & Description */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 leading-snug">{task.title}</h1>
        {task.description && (
          <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
            {task.description}
          </p>
        )}
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3.5 rounded-lg border border-slate-200">
        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <User className="h-3 w-3" /> Assignee
          </span>
          <div className="flex items-center gap-2 pt-0.5 font-medium text-slate-800">
            {assignee ? (
              <>
                <span
                  className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: assignee.color }}
                >
                  {assignee.name.charAt(0)}
                </span>
                <span>{assignee.name}</span>
              </>
            ) : (
              <span className="text-slate-400">Unassigned</span>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Calendar className="h-3 w-3" /> Due Date
          </span>
          <div className="pt-0.5 font-medium text-slate-800">
            {task.due_date ? formatDate(task.due_date) : 'No deadline set'}
          </div>
        </div>

        <div className="space-y-1 col-span-2 pt-2 border-t border-slate-200/60">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Task Progress</span>
            <span className="font-bold text-slate-800">{task.progress}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Subtasks Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
            <ListTodo className="h-4 w-4 text-blue-600" />
            <span>Subtasks ({task.subtasks?.length || 0})</span>
          </div>

          {!showSubtaskInput && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSubtaskInput(true)}
              className="h-6 text-[11px] gap-1 text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-3 w-3" />
              <span>Add Subtask</span>
            </Button>
          )}
        </div>

        {/* New subtask input */}
        {showSubtaskInput && (
          <form onSubmit={handleAddSubtask} className="flex gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
            <input
              type="text"
              autoFocus
              placeholder="Subtask title..."
              value={newSubtaskTitle}
              onChange={e => setNewSubtaskTitle(e.target.value)}
              className="flex-1 text-xs bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Button type="submit" size="sm" className="h-7 text-xs">
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSubtaskInput(false)}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
          </form>
        )}

        {/* Subtask list */}
        {task.subtasks && task.subtasks.length > 0 ? (
          <div className="space-y-1.5">
            {task.subtasks.map(st => {
              const isDone = st.status === 'Completed';
              return (
                <div
                  key={st.id}
                  onClick={() => handleToggleSubtask(st)}
                  className="flex items-center gap-2.5 p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors text-xs"
                >
                  <div
                    className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="h-3 w-3" />}
                  </div>
                  <span className={`flex-1 truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {st.title}
                  </span>
                  {st.due_date && (
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formatDate(st.due_date)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          !showSubtaskInput && (
            <p className="text-[11px] text-slate-400 italic">No subtasks assigned yet.</p>
          )
        )}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Tag className="h-3 w-3" /> Tags
          </span>
          <div className="flex flex-wrap gap-1.5">
            {task.tags.map(tag => (
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
      {task.notes && (
        <div className="space-y-1.5">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <FileText className="h-3 w-3" /> Internal Notes
          </span>
          <p className="text-xs text-slate-700 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60 leading-relaxed">
            {task.notes}
          </p>
        </div>
      )}

      {/* Chronological Comments Feed */}
      <div className="space-y-3 pt-3 border-t border-slate-200">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
          <MessageSquare className="h-4 w-4 text-blue-600" />
          <span>Activity & Comments ({comments.length})</span>
        </div>

        {/* Comment list */}
        <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
          {comments.map(c => (
            <div key={c.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-semibold text-slate-800">{c.author_name}</span>
                <span className="text-slate-400">{formatDateTime(c.created_at)}</span>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed">{c.comment}</p>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-[11px] text-slate-400 italic">No comments yet. Start the conversation.</p>
          )}
        </div>

        {/* Add comment input */}
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            placeholder="Add a comment or operational update..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            className="flex-1 text-xs rounded-md border border-slate-300 bg-white px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
          <Button type="submit" size="sm" disabled={!newComment.trim()} className="gap-1 text-xs">
            <Send className="h-3 w-3" />
            <span>Post</span>
          </Button>
        </form>
      </div>
    </Drawer>
  );
}
