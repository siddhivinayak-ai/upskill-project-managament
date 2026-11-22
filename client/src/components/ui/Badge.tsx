import React from 'react';
import { cn } from '../../lib/utils';
import { TaskStatus, TaskPriority, TrainerStatus } from '../../types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline' | 'slate';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'sm', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    outline: 'bg-transparent text-slate-600 border-slate-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded font-medium border select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus | TrainerStatus | string }) {
  switch (status) {
    case 'Completed':
    case 'Active':
      return <Badge variant="success">{status}</Badge>;
    case 'In Progress':
      return <Badge variant="info">{status}</Badge>;
    case 'Not Started':
    case 'Inactive':
      return <Badge variant="slate">{status}</Badge>;
    case 'On Hold':
      return <Badge variant="warning">{status}</Badge>;
    case 'Blacklisted':
      return <Badge variant="danger">{status}</Badge>;
    default:
      return <Badge variant="slate">{status}</Badge>;
  }
}

export function PriorityBadge({ priority }: { priority: TaskPriority | string }) {
  switch (priority) {
    case 'Urgent':
      return (
        <Badge variant="danger" className="font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          Urgent
        </Badge>
      );
    case 'High':
      return (
        <Badge variant="warning">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          High
        </Badge>
      );
    case 'Medium':
      return (
        <Badge variant="info">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          Medium
        </Badge>
      );
    case 'Low':
      return (
        <Badge variant="slate">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Low
        </Badge>
      );
    default:
      return <Badge variant="slate">{priority}</Badge>;
  }
}
