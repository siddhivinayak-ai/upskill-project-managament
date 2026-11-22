import { useState, useEffect } from 'react';
import { Task, Employee } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getEmployees } from '@/lib/mockStore';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => void;
  initialData?: Task | null;
  parentTaskId?: string | null;
}

export function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  parentTaskId,
}: TaskFormModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    category: 'Client Project',
    project: 'Titan Industries Q1 Cohort',
    status: 'Not Started',
    priority: 'Medium',
    assigned_to: '',
    collaborators: [],
    start_date: new Date().toISOString().split('T')[0],
    due_date: '',
    progress: 0,
    tags: [],
    notes: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getEmployees().then(emps => {
      setEmployees(emps);
      if (!initialData && emps.length > 0) {
        setFormData(prev => ({ ...prev, assigned_to: prev.assigned_to || emps[0].id }));
      }
    });
  }, [initialData]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || 'Client Project',
        project: initialData.project || '',
        status: initialData.status || 'Not Started',
        priority: initialData.priority || 'Medium',
        assigned_to: initialData.assigned_to || '',
        collaborators: initialData.collaborators || [],
        start_date: initialData.start_date || '',
        due_date: initialData.due_date || '',
        progress: initialData.progress ?? 0,
        tags: initialData.tags || [],
        notes: initialData.notes || '',
        parent_task_id: initialData.parent_task_id || null,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'Client Project',
        project: 'Titan Industries Q1 Cohort',
        status: 'Not Started',
        priority: 'Medium',
        assigned_to: employees[0]?.id || '',
        collaborators: [],
        start_date: new Date().toISOString().split('T')[0],
        due_date: '',
        progress: 0,
        tags: [],
        notes: '',
        parent_task_id: parentTaskId || null,
      });
    }
    setErrors({});
  }, [initialData, isOpen, parentTaskId, employees]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title?.trim()) {
      newErrors.title = 'Task name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== t),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Task' : parentTaskId ? 'Create Subtask' : 'Create New Task'}
      description="Fill in task details, assignee, dates, and priority."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Title */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Task Name <span className="text-rose-500">*</span>
          </label>
          <Input
            placeholder="e.g. Conduct Stage 1 Curriculum Audit"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            error={errors.title}
            className="text-xs"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Description</label>
          <textarea
            rows={2}
            placeholder="Outline objectives, deliverables, and expectations..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-md border border-slate-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>

        {/* Category & Project */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Client Project">Client Project</option>
              <option value="Trainer Scouting">Trainer Scouting</option>
              <option value="Internal Ops">Internal Ops</option>
              <option value="Documentation">Documentation</option>
              <option value="Administrative">Administrative</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Project / Group</label>
            <Input
              placeholder="e.g. Titan Industries Q1 Cohort"
              value={formData.project}
              onChange={e => setFormData({ ...formData, project: e.target.value })}
              className="text-xs"
            />
          </div>
        </div>

        {/* Assignment & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Assigned To</label>
            <select
              value={formData.assigned_to}
              onChange={e => setFormData({ ...formData, assigned_to: e.target.value })}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Timeline & Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Start Date</label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={e => setFormData({ ...formData, start_date: e.target.value })}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Due Date</label>
            <Input
              type="date"
              value={formData.due_date}
              onChange={e => setFormData({ ...formData, due_date: e.target.value })}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Progress ({formData.progress}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.progress || 0}
              onChange={e => setFormData({ ...formData, progress: Number(e.target.value) })}
              className="w-full mt-2 accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Tags</label>
          <div className="flex gap-2">
            <Input
              placeholder="Add tag and press Enter or Add..."
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="text-xs flex-1"
            />
            <Button type="button" variant="secondary" size="sm" onClick={handleAddTag}>
              Add
            </Button>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {formData.tags.map(t => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded bg-slate-100 text-slate-700 px-2 py-0.5 text-[11px] font-medium"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Internal Notes */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Internal Notes</label>
          <textarea
            rows={2}
            placeholder="Confidential or internal observations..."
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            className="w-full rounded-md border border-slate-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {initialData ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
