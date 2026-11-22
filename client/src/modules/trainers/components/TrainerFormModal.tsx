import { useState, useEffect } from 'react';
import { Trainer, TrainingMode, TrainerStatus } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface TrainerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Trainer>) => void;
  initialData?: Trainer | null;
}

const AVAILABLE_CATEGORIES = [
  'Manufacturing',
  'Six Sigma',
  'Automation',
  'Robotics',
  'Industry 4.0',
  'Operational Excellence',
  'Executive Leadership',
  'Strategic Management',
  'Cloud & DevOps',
  'Data & AI',
  'Agile & Scrum',
  'Compliance & Quality',
  'Industrial Safety & EHS',
  'EV & Clean Energy',
];

const AVAILABLE_INDUSTRIES = [
  'Automotive',
  'Aerospace',
  'Heavy Engineering',
  'Steel & Metals',
  'Pharmaceuticals',
  'FinTech & Banking',
  'Semiconductor',
  'Consumer Goods',
  'Chemicals',
];

export function TrainerFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: TrainerFormModalProps) {
  const [formData, setFormData] = useState<Partial<Trainer>>({
    trainer_name: '',
    email: '',
    phone: '',
    location: 'Pune',
    company_name: '',
    designation: '',
    experience: 5,
    categories: ['Manufacturing'],
    expertise: [],
    training_topics: [],
    industries_served: ['Automotive'],
    training_mode: ['Offline', 'Hybrid'],
    status: 'Active',
    linkedin_url: '',
    notes: '',
    source_of_contact: 'LinkedIn Outreach',
  });

  const [expertiseInput, setExpertiseInput] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        trainer_name: initialData.trainer_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        location: initialData.location || 'Pune',
        company_name: initialData.company_name || '',
        designation: initialData.designation || '',
        experience: initialData.experience ?? 5,
        categories: initialData.categories || [],
        expertise: initialData.expertise || [],
        training_topics: initialData.training_topics || [],
        industries_served: initialData.industries_served || [],
        training_mode: initialData.training_mode || ['Offline'],
        status: initialData.status || 'Active',
        linkedin_url: initialData.linkedin_url || '',
        notes: initialData.notes || '',
        source_of_contact: initialData.source_of_contact || '',
      });
    } else {
      setFormData({
        trainer_name: '',
        email: '',
        phone: '',
        location: 'Pune',
        company_name: '',
        designation: '',
        experience: 5,
        categories: ['Manufacturing'],
        expertise: [],
        training_topics: [],
        industries_served: ['Automotive'],
        training_mode: ['Offline', 'Hybrid'],
        status: 'Active',
        linkedin_url: '',
        notes: '',
        source_of_contact: 'Direct Inbound',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.trainer_name?.trim()) {
      newErrors.trainer_name = 'Trainer name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleCategory = (cat: string) => {
    const current = formData.categories || [];
    if (current.includes(cat)) {
      setFormData({ ...formData, categories: current.filter(c => c !== cat) });
    } else {
      setFormData({ ...formData, categories: [...current, cat] });
    }
  };

  const toggleIndustry = (ind: string) => {
    const current = formData.industries_served || [];
    if (current.includes(ind)) {
      setFormData({ ...formData, industries_served: current.filter(i => i !== ind) });
    } else {
      setFormData({ ...formData, industries_served: [...current, ind] });
    }
  };

  const toggleMode = (mode: TrainingMode) => {
    const current = formData.training_mode || [];
    if (current.includes(mode)) {
      if (current.length <= 1) return; // Keep at least one
      setFormData({ ...formData, training_mode: current.filter(m => m !== mode) });
    } else {
      setFormData({ ...formData, training_mode: [...current, mode] });
    }
  };

  const handleAddExpertise = () => {
    if (expertiseInput.trim() && !formData.expertise?.includes(expertiseInput.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise: [...(prev.expertise || []), expertiseInput.trim()],
      }));
      setExpertiseInput('');
    }
  };

  const handleAddTopic = () => {
    if (topicInput.trim() && !formData.training_topics?.includes(topicInput.trim())) {
      setFormData(prev => ({
        ...prev,
        training_topics: [...(prev.training_topics || []), topicInput.trim()],
      }));
      setTopicInput('');
    }
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
      title={initialData ? 'Edit Trainer Record' : 'Add Master Trainer'}
      description="Store verified professional credentials, expertise domains, and training track record."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Personal Details */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            1. Personal & Contact Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Trainer Name <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Dr. Rajesh Mehta"
                value={formData.trainer_name}
                onChange={e => setFormData({ ...formData, trainer_name: e.target.value })}
                error={errors.trainer_name}
                className="text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Location / Base City</label>
              <Input
                placeholder="e.g. Pune, Mumbai, Bengaluru"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Email Address</label>
              <Input
                type="email"
                placeholder="rajesh.mehta@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
              <Input
                placeholder="+91 98220 12345"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">LinkedIn Profile URL</label>
              <Input
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedin_url}
                onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            2. Professional & Institutional Affiliation
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Company / Organization</label>
              <Input
                placeholder="e.g. LeanKraft Advisory"
                value={formData.company_name}
                onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                className="text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Designation / Role</label>
              <Input
                placeholder="e.g. Principal Lean Coach"
                value={formData.designation}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                className="text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Experience (Years)</label>
              <Input
                type="number"
                min="0"
                max="50"
                value={formData.experience}
                onChange={e => setFormData({ ...formData, experience: Number(e.target.value) })}
                className="text-xs"
              />
            </div>
          </div>
        </div>

        {/* Categories (Multi-select) */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block font-medium text-slate-700">
            Training Categories (Select applicable)
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 rounded-md border border-slate-200 bg-slate-50">
            {AVAILABLE_CATEGORIES.map(cat => {
              const isSelected = formData.categories?.includes(cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Expertise & Topics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          {/* Areas of Expertise */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Areas of Expertise</label>
            <div className="flex gap-1.5 mb-1.5">
              <Input
                placeholder="e.g. Value Stream Mapping"
                value={expertiseInput}
                onChange={e => setExpertiseInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddExpertise();
                  }
                }}
                className="text-xs"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddExpertise}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.expertise?.map(item => (
                <span
                  key={item}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        expertise: formData.expertise?.filter(i => i !== item),
                      })
                    }
                    className="text-slate-400 hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Training Topics */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Specialized Topics</label>
            <div className="flex gap-1.5 mb-1.5">
              <Input
                placeholder="e.g. Zero Defect Manufacturing"
                value={topicInput}
                onChange={e => setTopicInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTopic();
                  }
                }}
                className="text-xs"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddTopic}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.training_topics?.map(topic => (
                <span
                  key={topic}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1"
                >
                  {topic}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        training_topics: formData.training_topics?.filter(t => t !== topic),
                      })
                    }
                    className="text-slate-400 hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Mode & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block font-medium text-slate-700 mb-1.5">Training Delivery Mode</label>
            <div className="flex gap-2">
              {(['Offline', 'Online', 'Hybrid'] as TrainingMode[]).map(mode => {
                const isSelected = formData.training_mode?.includes(mode);
                return (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => toggleMode(mode)}
                    className={`flex-1 py-1.5 rounded text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1.5">Trainer Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as TrainerStatus })}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Active">Active (Recommended)</option>
              <option value="Inactive">Inactive / On Sabbatical</option>
              <option value="Blacklisted">Blacklisted (Do Not Engage)</option>
            </select>
          </div>
        </div>

        {/* Internal Notes & Source */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Source of Contact</label>
            <Input
              placeholder="e.g. Conference 2025, VP Ops Referral"
              value={formData.source_of_contact}
              onChange={e => setFormData({ ...formData, source_of_contact: e.target.value })}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Internal Notes</label>
            <textarea
              rows={2}
              placeholder="Key strengths, commercial rate, feedback from past cohorts..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-md border border-slate-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {initialData ? 'Save Changes' : 'Save Trainer Record'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
