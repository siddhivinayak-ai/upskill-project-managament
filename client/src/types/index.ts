export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  color: string;
  avatarUrl?: string;
  created_at: string;
}

export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category?: string;
  project?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to?: string;
  collaborators?: string[];
  parent_task_id?: string | null;
  start_date?: string;
  due_date?: string;
  progress: number;
  color?: string;
  tags?: string[];
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  subtasks?: Task[];
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string;
  author_name: string;
  comment: string;
  created_at: string;
}

export type TrainingMode = 'Online' | 'Offline' | 'Hybrid';
export type TrainerStatus = 'Active' | 'Inactive' | 'Blacklisted';

export interface Trainer {
  id: string;
  trainer_name: string;
  email: string;
  phone: string;
  location: string;
  company_name: string;
  designation: string;
  experience: number;
  categories: string[];
  expertise: string[];
  training_topics: string[];
  industries_served: string[];
  training_mode: TrainingMode[];
  status: TrainerStatus;
  linkedin_url?: string;
  notes?: string;
  source_of_contact?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FilterCondition {
  id: string;
  field: string;
  operator: 
    | 'equals' 
    | 'contains' 
    | 'starts_with' 
    | 'is_empty' 
    | 'not_empty'
    | 'greater_than' 
    | 'less_than' 
    | 'between'
    | 'is' 
    | 'is_not'
    | 'in'
    | 'not_in'
    | 'is_true'
    | 'is_false';
  value: any;
  secondValue?: any;
}

export interface FilterGroup {
  id: string;
  logic: 'AND' | 'OR';
  conditions: FilterCondition[];
}

export interface SavedReport {
  id: string;
  report_name: string;
  source_table: 'trainers' | 'tasks' | 'drive';
  description?: string;
  configuration: {
    columns: string[];
    filterGroups: FilterGroup[];
    sort?: { field: string; direction: 'asc' | 'desc' } | null;
    columnWidths?: Record<string, number>;
    columnOrder?: string[];
    density?: 'compact' | 'normal' | 'relaxed';
  };
  is_default?: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DriveFolder {
  id: string;
  folder_name: string;
  description?: string;
  category: string;
  department: string;
  drive_url: string;
  parent_folder_id?: string | null;
  folder_type: 'Folder' | 'Shared Drive' | 'Master Sheet' | 'Document';
  tags: string[];
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardWidget {
  id: string;
  module: 'overview' | 'trainers' | 'tasks' | 'drive';
  widget_type: 'kpi' | 'chart' | 'recent' | 'report_table';
  title: string;
  configuration: Record<string, any>;
  position: { x: number; y: number; w: number; h: number };
}
