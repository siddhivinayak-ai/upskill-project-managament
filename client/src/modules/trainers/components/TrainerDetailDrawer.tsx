import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  ExternalLink, 
  Award, 
  BookOpen, 
  Factory, 
  FileText, 
  Copy, 
  Edit3, 
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { Trainer } from '@/types';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { StatusBadge, Badge } from '@/components/ui/Badge';

interface TrainerDetailDrawerProps {
  trainer: Trainer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (trainer: Trainer) => void;
  onDuplicate: (trainerId: string) => void;
  onDelete: (trainerId: string) => void;
}

export function TrainerDetailDrawer({
  trainer,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
}: TrainerDetailDrawerProps) {
  if (!trainer) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      width="xl"
      title={
        <div className="flex items-center gap-2">
          <StatusBadge status={trainer.status} />
          <Badge variant="purple" size="sm">
            {trainer.experience} Years Experience
          </Badge>
        </div>
      }
      subtitle={
        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" /> {trainer.company_name || 'Independent'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {trainer.location}
          </span>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (confirm(`Delete trainer profile for ${trainer.trainer_name}?`)) {
                onDelete(trainer.id);
                onClose();
              }
            }}
            className="gap-1 text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onDuplicate(trainer.id);
                onClose();
              }}
              className="gap-1 text-xs"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Duplicate</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onEdit(trainer);
                onClose();
              }}
              className="gap-1 text-xs"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Profile</span>
            </Button>
          </div>
        </div>
      }
    >
      {/* Header Info */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900">{trainer.trainer_name}</h1>
        <p className="text-xs font-medium text-slate-600">{trainer.designation || 'Corporate Trainer'}</p>
      </div>

      {/* Quick Contact Bar */}
      <div className="flex flex-wrap gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
        {trainer.email && (
          <a
            href={`mailto:${trainer.email}`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:text-blue-600 transition-colors"
          >
            <Mail className="h-3.5 w-3.5 text-slate-400" />
            <span>{trainer.email}</span>
          </a>
        )}

        {trainer.phone && (
          <a
            href={`tel:${trainer.phone}`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:text-blue-600 transition-colors"
          >
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            <span>{trainer.phone}</span>
          </a>
        )}

        {trainer.linkedin_url && (
          <a
            href={trainer.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>LinkedIn Profile</span>
          </a>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5 text-blue-500" /> Primary Disciplines & Categories
        </span>
        <div className="flex flex-wrap gap-1.5">
          {trainer.categories.map(cat => (
            <span
              key={cat}
              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Areas of Expertise */}
      {trainer.expertise && trainer.expertise.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Key Methodologies & Expertise
          </span>
          <div className="flex flex-wrap gap-1.5">
            {trainer.expertise.map(item => (
              <span
                key={item}
                className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 border border-slate-200 font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Specialized Training Topics */}
      {trainer.training_topics && trainer.training_topics.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-purple-500" /> Typical Sessions & Course Titles
          </span>
          <ul className="space-y-1.5">
            {trainer.training_topics.map(topic => (
              <li
                key={topic}
                className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50/70 p-2 rounded border border-slate-100"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>{topic}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Industries & Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-lg border border-slate-200">
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Factory className="h-3.5 w-3.5 text-amber-500" /> Industries Served
          </span>
          <div className="flex flex-wrap gap-1 pt-0.5">
            {trainer.industries_served.map(ind => (
              <span key={ind} className="px-1.5 py-0.5 rounded text-[11px] bg-white border border-slate-200 text-slate-600">
                {ind}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Delivery Formats
          </span>
          <div className="flex flex-wrap gap-1 pt-0.5">
            {trainer.training_mode.map(mode => (
              <span key={mode} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {mode}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Notes & Source */}
      {trainer.notes && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-slate-400" /> Internal Notes & Feedback
          </span>
          <p className="text-xs text-slate-700 bg-amber-50/60 p-3 rounded-lg border border-amber-200/60 leading-relaxed">
            {trainer.notes}
          </p>
        </div>
      )}

      {trainer.source_of_contact && (
        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
          <span>Source of contact: <strong className="text-slate-600">{trainer.source_of_contact}</strong></span>
          <span>ID: {trainer.id}</span>
        </div>
      )}
    </Drawer>
  );
}
