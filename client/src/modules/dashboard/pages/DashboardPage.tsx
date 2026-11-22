import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  Users, 
  FolderSync, 
  TrendingUp, 
  Plus, 
  ArrowRight, 
  Calendar, 
  Building2, 
  Clock, 
  CheckCircle2, 
  Layers
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { PageLayout } from '../../../components/layout/PageLayout';
import { Button } from '../../../components/ui/Button';
import { StatusBadge, PriorityBadge } from '../../../components/ui/Badge';
import { Task, Trainer, DriveFolder } from '../../../types';
import { formatDate } from '../../../lib/utils';
import { 
  getTasks, 
  getTrainers, 
  getDriveFolders, 
  getCurrentUser,
  subscribeToStore 
} from '../../../lib/mockStore';

const STATUS_COLORS: Record<string, string> = {
  'Not Started': '#94a3b8',
  'In Progress': '#3b82f6',
  'On Hold': '#f59e0b',
  'Completed': '#10b981',
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

export function DashboardPage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>([]);

  const loadData = async () => {
    const [t, tr, d] = await Promise.all([
      getTasks(),
      getTrainers(),
      getDriveFolders(),
    ]);
    setTasks(t);
    setTrainers(tr);
    setDriveFolders(d);
  };

  useEffect(() => {
    loadData();
    const u1 = subscribeToStore('businessflow_tasks_v1', loadData);
    const u2 = subscribeToStore('businessflow_trainers_v1', loadData);
    const u3 = subscribeToStore('businessflow_drive_v1', loadData);
    return () => {
      u1();
      u2();
      u3();
    };
  }, []);

  // Stats
  const activeTasks = tasks.filter(t => t.status !== 'Completed').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Task Status Distribution for BarChart
  const taskStatusData = [
    { name: 'Not Started', count: tasks.filter(t => t.status === 'Not Started').length },
    { name: 'In Progress', count: tasks.filter(t => t.status === 'In Progress').length },
    { name: 'On Hold', count: tasks.filter(t => t.status === 'On Hold').length },
    { name: 'Completed', count: completedTasks },
  ];

  // Category Distribution for Trainers PieChart
  const categoryCountMap: Record<string, number> = {};
  trainers.forEach(tr => {
    tr.categories.forEach(c => {
      categoryCountMap[c] = (categoryCountMap[c] || 0) + 1;
    });
  });

  const trainerCategoryData = Object.entries(categoryCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // Upcoming tasks due soon
  const upcomingTasks = [...tasks]
    .filter(t => t.status !== 'Completed' && t.due_date)
    .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1))
    .slice(0, 4);

  // Recently added trainers
  const recentTrainers = [...trainers].slice(0, 4);

  return (
    <PageLayout
      title={`Welcome back, ${currentUser.name}`}
      description="BusinessFlow operational dashboard: tasks progress, trainer capacity, and registered workspace resources."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/trainers')}
            className="text-xs"
          >
            Trainer Master
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/tasks')}
            className="text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Manage Tasks</span>
          </Button>
        </div>
      }
    >
      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div
          onClick={() => navigate('/tasks')}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Tasks
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeTasks}</span>
            <span className="text-xs text-slate-500">of {totalTasks} tasks</span>
          </div>
          <div className="mt-2.5 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Completion Rate</span>
            <span className="font-semibold text-slate-700">{completionRate}%</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div
          onClick={() => navigate('/trainers')}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Trainer Capacity
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{trainers.length}</span>
            <span className="text-xs text-emerald-600 font-semibold">100% active</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500 leading-tight">
            Certified across {Object.keys(categoryCountMap).length} technical & corporate disciplines.
          </p>
        </div>

        {/* KPI 3 */}
        <div
          onClick={() => navigate('/drive')}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Drive Assets
            </span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FolderSync className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{driveFolders.length}</span>
            <span className="text-xs text-slate-500">directories</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500 leading-tight">
            Centralized Google Drive links across 5 internal departments.
          </p>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-blue-100 text-xs font-semibold uppercase tracking-wider">
              <span>Operational Health</span>
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="mt-3 text-2xl font-bold">Optimal</div>
            <p className="mt-1 text-xs text-blue-100 leading-relaxed">
              All 3 modules synchronized with zero backend latency.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-white/20 text-[11px] text-blue-100 flex items-center justify-between">
            <span>Engine Mode</span>
            <span className="font-semibold bg-white/20 px-2 py-0.5 rounded">Mock Offline Active</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Task Status Chart */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Task Status Breakdown</h3>
              <p className="text-xs text-slate-500">Current state of operational activities</p>
            </div>
            <span className="text-xs font-bold text-blue-600">{tasks.length} Total</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {taskStatusData.map(entry => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trainer Categories Distribution */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Top Trainer Disciplines</h3>
              <p className="text-xs text-slate-500">Distribution of expertise in faculty pool</p>
            </div>
            <button
              onClick={() => navigate('/trainers')}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              View All
            </button>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trainerCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {trainerCategoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-600">
            {trainerCategoryData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span>{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Bottom Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upcoming Deadlines */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900">Upcoming Deadlines</h3>
            </div>
            <button
              onClick={() => navigate('/tasks')}
              className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1"
            >
              <span>All Tasks</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2">
            {upcomingTasks.map(t => (
              <div
                key={t.id}
                onClick={() => navigate('/tasks')}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between text-xs group"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                    {t.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{t.project || 'General'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <Calendar className="h-3 w-3 text-slate-400" /> {formatDate(t.due_date)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}

            {upcomingTasks.length === 0 && (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                All upcoming tasks are completed!
              </p>
            )}
          </div>
        </div>

        {/* Recently Added Faculty */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-slate-900">Recently Added Trainers</h3>
            </div>
            <button
              onClick={() => navigate('/trainers')}
              className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1"
            >
              <span>Directory</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2">
            {recentTrainers.map(tr => (
              <div
                key={tr.id}
                onClick={() => navigate('/trainers')}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between text-xs group"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    {tr.trainer_name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5 truncate">
                    <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate">{tr.company_name} • {tr.location}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {tr.experience} yrs
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
