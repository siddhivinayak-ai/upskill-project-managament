import { Employee, Task, TaskComment, Trainer, SavedReport, DriveFolder, FilterGroup } from '../types';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_TASKS, 
  INITIAL_COMMENTS, 
  INITIAL_TRAINERS, 
  INITIAL_SAVED_REPORTS, 
  INITIAL_DRIVE_FOLDERS 
} from './mockData';
import { generateId } from './utils';

const STORAGE_KEYS = {
  EMPLOYEES: 'businessflow_employees_v1',
  CURRENT_USER_ID: 'businessflow_current_user_v1',
  TASKS: 'businessflow_tasks_v1',
  COMMENTS: 'businessflow_comments_v1',
  TRAINERS: 'businessflow_trainers_v1',
  SAVED_REPORTS: 'businessflow_reports_v1',
  DRIVE_FOLDERS: 'businessflow_drive_v1',
};

// Simple event bus for reactivity across tabs/components
type Listener = () => void;
const listeners: Record<string, Set<Listener>> = {};

function notify(key: string) {
  if (listeners[key]) {
    listeners[key].forEach(l => l());
  }
}

export function subscribeToStore(key: string, listener: Listener) {
  if (!listeners[key]) {
    listeners[key] = new Set();
  }
  listeners[key].add(listener);
  return () => {
    listeners[key]?.delete(listener);
  };
}

function getStored<T>(key: string, initialData: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return initialData;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    notify(key);
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

// Ensure initial seed
export function initializeStore() {
  getStored(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  getStored(STORAGE_KEYS.CURRENT_USER_ID, INITIAL_EMPLOYEES[1].id); // Default to Sarah Jenkins (Operations)
  getStored(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  getStored(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  getStored(STORAGE_KEYS.TRAINERS, INITIAL_TRAINERS);
  getStored(STORAGE_KEYS.SAVED_REPORTS, INITIAL_SAVED_REPORTS);
  getStored(STORAGE_KEYS.DRIVE_FOLDERS, INITIAL_DRIVE_FOLDERS);
}

// ---------------- EMPLOYEES ----------------
export async function getEmployees(): Promise<Employee[]> {
  return getStored<Employee[]>(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
}

export function getCurrentUser(): Employee {
  const employees = getStored<Employee[]>(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  const currentId = getStored<string>(STORAGE_KEYS.CURRENT_USER_ID, employees[1]?.id || 'emp-2');
  return employees.find(e => e.id === currentId) || employees[0];
}

export function setCurrentUser(id: string): Employee {
  setStored(STORAGE_KEYS.CURRENT_USER_ID, id);
  return getCurrentUser();
}

// ---------------- TASKS ----------------
export async function getTasks(): Promise<Task[]> {
  const allTasks = getStored<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  // Attach subtasks
  const parentTasks = allTasks.filter(t => !t.parent_task_id);
  const subtasks = allTasks.filter(t => t.parent_task_id);

  return parentTasks.map(parent => ({
    ...parent,
    subtasks: subtasks.filter(st => st.parent_task_id === parent.id),
  }));
}

export async function getAllTasksFlat(): Promise<Task[]> {
  return getStored<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
}

export async function getTaskById(id: string): Promise<Task | null> {
  const allTasks = await getAllTasksFlat();
  const task = allTasks.find(t => t.id === id);
  if (!task) return null;

  const subtasks = allTasks.filter(t => t.parent_task_id === id);
  return { ...task, subtasks };
}

export async function createTask(taskData: Partial<Task>): Promise<Task> {
  const all = await getAllTasksFlat();
  const currentUser = getCurrentUser();
  const now = new Date().toISOString();

  const newTask: Task = {
    id: generateId('task'),
    title: taskData.title || 'Untitled Task',
    description: taskData.description || '',
    category: taskData.category || 'Client Project',
    project: taskData.project || 'General',
    status: taskData.status || 'Not Started',
    priority: taskData.priority || 'Medium',
    assigned_to: taskData.assigned_to || currentUser.id,
    collaborators: taskData.collaborators || [],
    parent_task_id: taskData.parent_task_id || null,
    start_date: taskData.start_date || new Date().toISOString().split('T')[0],
    due_date: taskData.due_date || '',
    progress: taskData.progress ?? 0,
    color: taskData.color || '#3b82f6',
    tags: taskData.tags || [],
    notes: taskData.notes || '',
    created_by: currentUser.id,
    created_at: now,
    updated_at: now,
  };

  all.unshift(newTask);
  setStored(STORAGE_KEYS.TASKS, all);
  return newTask;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const all = await getAllTasksFlat();
  const idx = all.findIndex(t => t.id === id);
  if (idx === -1) throw new Error(`Task ${id} not found`);

  const updated: Task = {
    ...all[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // If progress is 100%, set status to Completed
  if (updates.progress === 100 && updated.status !== 'Completed') {
    updated.status = 'Completed';
  } else if (updates.status === 'Completed' && updated.progress < 100) {
    updated.progress = 100;
  }

  all[idx] = updated;
  setStored(STORAGE_KEYS.TASKS, all);
  return updated;
}

export async function deleteTask(id: string): Promise<boolean> {
  let all = await getAllTasksFlat();
  // Also delete subtasks
  all = all.filter(t => t.id !== id && t.parent_task_id !== id);
  setStored(STORAGE_KEYS.TASKS, all);
  return true;
}

export async function deleteTasks(ids: string[]): Promise<boolean> {
  const idSet = new Set(ids);
  let all = await getAllTasksFlat();
  all = all.filter(t => !idSet.has(t.id) && !(t.parent_task_id && idSet.has(t.parent_task_id)));
  setStored(STORAGE_KEYS.TASKS, all);
  return true;
}

export async function bulkUpdateTaskStatus(ids: string[], status: Task['status']): Promise<void> {
  const idSet = new Set(ids);
  const all = await getAllTasksFlat();
  const now = new Date().toISOString();
  all.forEach(t => {
    if (idSet.has(t.id)) {
      t.status = status;
      if (status === 'Completed') t.progress = 100;
      t.updated_at = now;
    }
  });
  setStored(STORAGE_KEYS.TASKS, all);
}

// ---------------- TASK COMMENTS ----------------
export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const all = getStored<TaskComment[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  return all
    .filter(c => c.task_id === taskId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function addTaskComment(taskId: string, commentText: string): Promise<TaskComment> {
  const all = getStored<TaskComment[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  const currentUser = getCurrentUser();
  const newComment: TaskComment = {
    id: generateId('comm'),
    task_id: taskId,
    author_id: currentUser.id,
    author_name: currentUser.name,
    comment: commentText,
    created_at: new Date().toISOString(),
  };

  all.push(newComment);
  setStored(STORAGE_KEYS.COMMENTS, all);
  return newComment;
}

// ---------------- TRAINERS ----------------
export async function getTrainers(): Promise<Trainer[]> {
  return getStored<Trainer[]>(STORAGE_KEYS.TRAINERS, INITIAL_TRAINERS);
}

export async function getTrainerById(id: string): Promise<Trainer | null> {
  const trainers = await getTrainers();
  return trainers.find(t => t.id === id) || null;
}

export async function createTrainer(trainerData: Partial<Trainer>): Promise<Trainer> {
  const all = await getTrainers();
  const currentUser = getCurrentUser();
  const now = new Date().toISOString();

  const newTrainer: Trainer = {
    id: generateId('tr'),
    trainer_name: trainerData.trainer_name || 'New Trainer',
    email: trainerData.email || '',
    phone: trainerData.phone || '',
    location: trainerData.location || 'Pune',
    company_name: trainerData.company_name || 'Independent Specialist',
    designation: trainerData.designation || 'Corporate Trainer',
    experience: Number(trainerData.experience) || 5,
    categories: trainerData.categories || ['Operational Excellence'],
    expertise: trainerData.expertise || [],
    training_topics: trainerData.training_topics || [],
    industries_served: trainerData.industries_served || ['Automotive'],
    training_mode: trainerData.training_mode || ['Offline', 'Hybrid'],
    status: trainerData.status || 'Active',
    linkedin_url: trainerData.linkedin_url || '',
    notes: trainerData.notes || '',
    source_of_contact: trainerData.source_of_contact || 'Direct Inbound',
    created_by: currentUser.id,
    created_at: now,
    updated_at: now,
  };

  all.unshift(newTrainer);
  setStored(STORAGE_KEYS.TRAINERS, all);
  return newTrainer;
}

export async function updateTrainer(id: string, updates: Partial<Trainer>): Promise<Trainer> {
  const all = await getTrainers();
  const idx = all.findIndex(t => t.id === id);
  if (idx === -1) throw new Error(`Trainer ${id} not found`);

  const updated: Trainer = {
    ...all[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  all[idx] = updated;
  setStored(STORAGE_KEYS.TRAINERS, all);
  return updated;
}

export async function duplicateTrainer(id: string): Promise<Trainer> {
  const trainer = await getTrainerById(id);
  if (!trainer) throw new Error('Trainer not found');

  return createTrainer({
    ...trainer,
    trainer_name: `${trainer.trainer_name} (Copy)`,
    email: trainer.email ? `copy_${trainer.email}` : '',
  });
}

export async function deleteTrainer(id: string): Promise<boolean> {
  let all = await getTrainers();
  all = all.filter(t => t.id !== id);
  setStored(STORAGE_KEYS.TRAINERS, all);
  return true;
}

export async function deleteTrainers(ids: string[]): Promise<boolean> {
  const idSet = new Set(ids);
  let all = await getTrainers();
  all = all.filter(t => !idSet.has(t.id));
  setStored(STORAGE_KEYS.TRAINERS, all);
  return true;
}

// ---------------- SAVED REPORTS (REPORT BUILDER) ----------------
export async function getSavedReports(sourceTable = 'trainers'): Promise<SavedReport[]> {
  const all = getStored<SavedReport[]>(STORAGE_KEYS.SAVED_REPORTS, INITIAL_SAVED_REPORTS);
  return all.filter(r => r.source_table === sourceTable);
}

export async function createSavedReport(reportData: Partial<SavedReport>): Promise<SavedReport> {
  const all = getStored<SavedReport[]>(STORAGE_KEYS.SAVED_REPORTS, INITIAL_SAVED_REPORTS);
  const currentUser = getCurrentUser();
  const now = new Date().toISOString();

  const newReport: SavedReport = {
    id: generateId('rep'),
    report_name: reportData.report_name || 'Custom Report',
    source_table: reportData.source_table || 'trainers',
    description: reportData.description || '',
    configuration: reportData.configuration || {
      columns: ['trainer_name', 'company_name', 'location', 'experience', 'categories', 'status'],
      filterGroups: [],
    },
    is_default: reportData.is_default || false,
    created_by: currentUser.id,
    created_at: now,
    updated_at: now,
  };

  all.unshift(newReport);
  setStored(STORAGE_KEYS.SAVED_REPORTS, all);
  return newReport;
}

export async function updateSavedReport(id: string, updates: Partial<SavedReport>): Promise<SavedReport> {
  const all = getStored<SavedReport[]>(STORAGE_KEYS.SAVED_REPORTS, INITIAL_SAVED_REPORTS);
  const idx = all.findIndex(r => r.id === id);
  if (idx === -1) throw new Error(`Report ${id} not found`);

  const updated: SavedReport = {
    ...all[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  all[idx] = updated;
  setStored(STORAGE_KEYS.SAVED_REPORTS, all);
  return updated;
}

export async function duplicateSavedReport(id: string): Promise<SavedReport> {
  const all = getStored<SavedReport[]>(STORAGE_KEYS.SAVED_REPORTS, INITIAL_SAVED_REPORTS);
  const report = all.find(r => r.id === id);
  if (!report) throw new Error('Report not found');

  return createSavedReport({
    ...report,
    report_name: `${report.report_name} (Copy)`,
    is_default: false,
  });
}

export async function deleteSavedReport(id: string): Promise<boolean> {
  let all = getStored<SavedReport[]>(STORAGE_KEYS.SAVED_REPORTS, INITIAL_SAVED_REPORTS);
  all = all.filter(r => r.id !== id);
  setStored(STORAGE_KEYS.SAVED_REPORTS, all);
  return true;
}

// ---------------- GOOGLE DRIVE FOLDERS ----------------
export async function getDriveFolders(): Promise<DriveFolder[]> {
  return getStored<DriveFolder[]>(STORAGE_KEYS.DRIVE_FOLDERS, INITIAL_DRIVE_FOLDERS);
}

export async function getDriveFolderById(id: string): Promise<DriveFolder | null> {
  const folders = await getDriveFolders();
  return folders.find(f => f.id === id) || null;
}

export async function createDriveFolder(folderData: Partial<DriveFolder>): Promise<DriveFolder> {
  const all = await getDriveFolders();
  const currentUser = getCurrentUser();
  const now = new Date().toISOString();

  const newFolder: DriveFolder = {
    id: generateId('drv'),
    folder_name: folderData.folder_name || 'Untitled Folder',
    description: folderData.description || '',
    category: folderData.category || 'Training Collateral',
    department: folderData.department || 'Operations',
    drive_url: folderData.drive_url || 'https://drive.google.com',
    parent_folder_id: folderData.parent_folder_id || null,
    folder_type: folderData.folder_type || 'Folder',
    tags: folderData.tags || [],
    notes: folderData.notes || '',
    created_by: currentUser.id,
    created_at: now,
    updated_at: now,
  };

  all.unshift(newFolder);
  setStored(STORAGE_KEYS.DRIVE_FOLDERS, all);
  return newFolder;
}

export async function updateDriveFolder(id: string, updates: Partial<DriveFolder>): Promise<DriveFolder> {
  const all = await getDriveFolders();
  const idx = all.findIndex(f => f.id === id);
  if (idx === -1) throw new Error(`Drive folder ${id} not found`);

  const updated: DriveFolder = {
    ...all[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  all[idx] = updated;
  setStored(STORAGE_KEYS.DRIVE_FOLDERS, all);
  return updated;
}

export async function deleteDriveFolder(id: string): Promise<boolean> {
  let all = await getDriveFolders();
  all = all.filter(f => f.id !== id);
  setStored(STORAGE_KEYS.DRIVE_FOLDERS, all);
  return true;
}

export async function deleteDriveFolders(ids: string[]): Promise<boolean> {
  const idSet = new Set(ids);
  let all = await getDriveFolders();
  all = all.filter(f => !idSet.has(f.id));
  setStored(STORAGE_KEYS.DRIVE_FOLDERS, all);
  return true;
}

// ---------------- FILTER EVALUATION ENGINE ----------------
export function evaluateFilterCondition(record: Record<string, any>, condition: { field: string; operator: string; value: any; secondValue?: any }): boolean {
  const rawValue = record[condition.field];
  const target = condition.value;

  switch (condition.operator) {
    case 'equals':
      if (typeof rawValue === 'string' && typeof target === 'string') {
        return rawValue.toLowerCase() === target.toLowerCase();
      }
      return rawValue == target;

    case 'is':
      return String(rawValue).toLowerCase() === String(target).toLowerCase();

    case 'is_not':
      return String(rawValue).toLowerCase() !== String(target).toLowerCase();

    case 'contains':
      if (Array.isArray(rawValue)) {
        return rawValue.some(item => String(item).toLowerCase().includes(String(target).toLowerCase()));
      }
      if (rawValue === undefined || rawValue === null) return false;
      return String(rawValue).toLowerCase().includes(String(target).toLowerCase());

    case 'starts_with':
      if (rawValue === undefined || rawValue === null) return false;
      return String(rawValue).toLowerCase().startsWith(String(target).toLowerCase());

    case 'is_empty':
      return rawValue === undefined || rawValue === null || rawValue === '' || (Array.isArray(rawValue) && rawValue.length === 0);

    case 'not_empty':
      return rawValue !== undefined && rawValue !== null && rawValue !== '' && (!Array.isArray(rawValue) || rawValue.length > 0);

    case 'greater_than':
      return Number(rawValue) > Number(target);

    case 'less_than':
      return Number(rawValue) < Number(target);

    case 'between':
      return Number(rawValue) >= Number(target) && Number(rawValue) <= Number(condition.secondValue ?? target);

    case 'in':
      if (Array.isArray(target)) {
        return target.some(t => String(t).toLowerCase() === String(rawValue).toLowerCase());
      }
      return false;

    case 'not_in':
      if (Array.isArray(target)) {
        return !target.some(t => String(t).toLowerCase() === String(rawValue).toLowerCase());
      }
      return true;

    default:
      return true;
  }
}

export function evaluateFilterGroups<T extends Record<string, any>>(records: T[], groups: FilterGroup[]): T[] {
  if (!groups || groups.length === 0) return records;

  return records.filter(record => {
    // All top-level groups must evaluate according to their internal conditions
    return groups.every(group => {
      if (!group.conditions || group.conditions.length === 0) return true;

      if (group.logic === 'AND') {
        return group.conditions.every(cond => evaluateFilterCondition(record, cond));
      } else {
        return group.conditions.some(cond => evaluateFilterCondition(record, cond));
      }
    });
  });
}

// Reset all store data back to initial seeds
export function resetStoreToDefaults() {
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(INITIAL_COMMENTS));
  localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(INITIAL_TRAINERS));
  localStorage.setItem(STORAGE_KEYS.SAVED_REPORTS, JSON.stringify(INITIAL_SAVED_REPORTS));
  localStorage.setItem(STORAGE_KEYS.DRIVE_FOLDERS, JSON.stringify(INITIAL_DRIVE_FOLDERS));
  Object.keys(STORAGE_KEYS).forEach(k => notify(STORAGE_KEYS[k as keyof typeof STORAGE_KEYS]));
}
