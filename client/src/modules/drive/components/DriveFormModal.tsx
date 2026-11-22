import { useState, useEffect } from 'react';
import { DriveFolder } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isValidUrl } from '@/lib/utils';

interface DriveFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<DriveFolder>) => void;
  initialData?: DriveFolder | null;
}

const CATEGORIES = [
  'Training Collateral',
  'Client Contracts',
  'Financial Reports',
  'SOPs & Guidelines',
  'Marketing Assets',
  'Project Deliverables',
  'General',
];

const DEPARTMENTS = [
  'Operations',
  'Training & Delivery',
  'Finance',
  'Leadership',
  'Sales',
  'Legal & Compliance',
];

export function DriveFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: DriveFormModalProps) {
  const [formData, setFormData] = useState<Partial<DriveFolder>>({
    folder_name: '',
    description: '',
    category: 'Training Collateral',
    department: 'Training & Delivery',
    drive_url: '',
    folder_type: 'Folder',
    tags: [],
    notes: '',
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        folder_name: initialData.folder_name || '',
        description: initialData.description || '',
        category: initialData.category || 'Training Collateral',
        department: initialData.department || 'Training & Delivery',
        drive_url: initialData.drive_url || '',
        folder_type: initialData.folder_type || 'Folder',
        tags: initialData.tags || [],
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        folder_name: '',
        description: '',
        category: 'Training Collateral',
        department: 'Training & Delivery',
        drive_url: '',
        folder_type: 'Folder',
        tags: [],
        notes: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.folder_name?.trim()) {
      newErrors.folder_name = 'Folder or asset name is required';
    }
    if (!formData.drive_url?.trim()) {
      newErrors.drive_url = 'Google Drive link is required';
    } else if (!isValidUrl(formData.drive_url)) {
      newErrors.drive_url = 'Please enter a valid URL (starting with https://)';
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
      title={initialData ? 'Edit Drive Asset' : 'Register Google Drive Asset'}
      description="Register external Google Drive folders, shared drives, or master spreadsheets."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Name */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Folder / Asset Name <span className="text-rose-500">*</span>
          </label>
          <Input
            placeholder="e.g. 2026 Client Cohort Deliverables & Slide Decks"
            value={formData.folder_name}
            onChange={e => setFormData({ ...formData, folder_name: e.target.value })}
            error={errors.folder_name}
            className="text-xs"
          />
        </div>

        {/* Google Drive Link */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Google Drive URL <span className="text-rose-500">*</span>
          </label>
          <Input
            type="url"
            placeholder="https://drive.google.com/drive/folders/..."
            value={formData.drive_url}
            onChange={e => setFormData({ ...formData, drive_url: e.target.value })}
            error={errors.drive_url}
            className="text-xs"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Accepts Google Drive folder links, Shared Drives, or Google Docs/Sheets URLs.
          </p>
        </div>

        {/* Category, Department & Folder Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Department</label>
            <select
              value={formData.department}
              onChange={e => setFormData({ ...formData, department: e.target.value })}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Asset Type</label>
            <select
              value={formData.folder_type}
              onChange={e => setFormData({ ...formData, folder_type: e.target.value as any })}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Folder">Folder</option>
              <option value="Shared Drive">Shared Drive</option>
              <option value="Master Sheet">Master Sheet</option>
              <option value="Document">Document</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Description & Purpose</label>
          <textarea
            rows={2}
            placeholder="Explain what documents belong in this directory and who maintains it..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-md border border-slate-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Taxonomy Tags</label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. 2026, Invoices, Contracts..."
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
          <label className="block font-medium text-slate-700 mb-1">Access Guidelines & Notes</label>
          <textarea
            rows={2}
            placeholder="e.g. Restricted edit access to Program Directors; trainers have viewer permissions..."
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
            {initialData ? 'Save Changes' : 'Register Folder'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
