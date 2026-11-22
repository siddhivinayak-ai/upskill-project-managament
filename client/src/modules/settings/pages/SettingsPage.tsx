import { useState, useEffect } from 'react';
import { 
  Database, 
  RotateCcw, 
  Download, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ShieldAlert,
  HardDrive
} from 'lucide-react';
import { PageLayout } from '../../../components/layout/PageLayout';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';
import { isSupabaseConfigured } from '../../../lib/supabase';
import { 
  getEmployees, 
  resetStoreToDefaults, 
  getTasks, 
  getTrainers, 
  getDriveFolders, 
  getSavedReports 
} from '../../../lib/mockStore';
import { Employee } from '../../../types';

export function SettingsPage() {
  const { success } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [counts, setCounts] = useState({
    tasks: 0,
    trainers: 0,
    drive: 0,
    reports: 0,
  });

  const loadData = async () => {
    const [emps, t, tr, d, r] = await Promise.all([
      getEmployees(),
      getTasks(),
      getTrainers(),
      getDriveFolders(),
      getSavedReports('trainers'),
    ]);
    setEmployees(emps);
    setCounts({
      tasks: t.length,
      trainers: tr.length,
      drive: d.length,
      reports: r.length,
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data back to original seed data? Any new tasks or trainers added will be refreshed.')) {
      resetStoreToDefaults();
      loadData();
      success('Database successfully reset to initial seed data');
    }
  };

  const handleExportBackup = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      counts,
      data: {
        employees,
      },
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `businessflow_backup_${Date.now()}.json`;
    a.click();
    success('Backup exported successfully');
  };

  return (
    <PageLayout
      title="Settings & System Configuration"
      description="Manage local mock database state, verify Supabase connection, and view team roster."
    >
      <div className="max-w-4xl space-y-6 text-xs">
        {/* Backend / Storage Engine Status */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Database Engine Status</h3>
                <p className="text-slate-500">How records are persisted and queried</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Local Engine Active (Real CRUD)'}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2 leading-relaxed text-slate-700">
            <p>
              <strong>Current Mode:</strong> Full interactive mock database in browser local storage. Every change (creating tasks, editing trainers, saving reports, subtasks, comments, folder links) is instantly saved and persists across page reloads.
            </p>
            <p className="text-slate-500 text-[11px]">
              To connect a real Supabase Postgres database in the future, simply provide <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">VITE_SUPABASE_URL</code> and <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">VITE_SUPABASE_ANON_KEY</code> in <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">client/.env</code>.
            </p>
          </div>

          {/* Quick counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Tasks Stored</span>
              <div className="text-lg font-bold text-slate-900 mt-1">{counts.tasks}</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Trainers Stored</span>
              <div className="text-lg font-bold text-slate-900 mt-1">{counts.trainers}</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Drive Folders</span>
              <div className="text-lg font-bold text-slate-900 mt-1">{counts.drive}</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Saved Reports</span>
              <div className="text-lg font-bold text-slate-900 mt-1">{counts.reports}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5 text-slate-700 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              <span>Reset to Factory Seed Data</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportBackup}
              className="gap-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export System Backup (JSON)</span>
            </Button>
          </div>
        </div>

        {/* Team Members Roster */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Internal Team Roster (4–5 Members)</h3>
              <p className="text-slate-500">Used for task assignment, collaborative reviews, and creator attribution</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-slate-50/40">
            {employees.map(emp => (
              <div key={emp.id} className="p-3 flex items-center justify-between hover:bg-white transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xs"
                    style={{ backgroundColor: emp.color }}
                  >
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{emp.name}</div>
                    <div className="text-slate-500 text-[11px]">{emp.email}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {emp.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Development Constraints Notice */}
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-900 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-xs text-amber-900">V1 Constraints in Effect</h4>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              As defined in the specification, authentication and complex multi-tenant permissions are intentionally out of scope for Version 1. You can switch active team identities using the switcher in the sidebar to simulate assigned tasks and creator actions.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
