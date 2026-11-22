import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Database, CheckSquare, Users, FolderSync, X } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { getTasks, getTrainers, getDriveFolders } from '../../lib/mockStore';
import { Task, Trainer, DriveFolder } from '../../types';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>([]);

  useEffect(() => {
    if (globalSearchOpen) {
      getTasks().then(setTasks);
      getTrainers().then(setTrainers);
      getDriveFolders().then(setDriveFolders);
    }
  }, [globalSearchOpen]);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbName = pathSegments.length === 0
    ? 'Dashboard'
    : pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1);

  // Filtered search results
  const filteredTasks = query
    ? tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase()) || t.category?.toLowerCase().includes(query.toLowerCase()))
    : [];

  const filteredTrainers = query
    ? trainers.filter(tr => 
        tr.trainer_name.toLowerCase().includes(query.toLowerCase()) ||
        tr.company_name.toLowerCase().includes(query.toLowerCase()) ||
        tr.location.toLowerCase().includes(query.toLowerCase()) ||
        tr.categories.some(c => c.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const filteredDrive = query
    ? driveFolders.filter(d => 
        d.folder_name.toLowerCase().includes(query.toLowerCase()) ||
        d.department.toLowerCase().includes(query.toLowerCase()) ||
        d.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const totalResults = filteredTasks.length + filteredTrainers.length + filteredDrive.length;

  return (
    <>
      <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between z-20 shrink-0">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">BusinessFlow</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">{breadcrumbName}</span>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md mx-6">
          <button
            onClick={() => setGlobalSearchOpen(true)}
            className="w-full flex items-center justify-between h-8 px-3 rounded-md bg-slate-50 border border-slate-200 text-slate-400 hover:bg-slate-100 hover:border-slate-300 transition-colors text-xs"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              <span>Search records, trainers, files...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right: Status badge & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Database className="h-3 w-3" />
            <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Local Engine Active'}</span>
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          <button
            className="relative p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="3 new system updates"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600" />
          </button>
        </div>
      </header>

      {/* Global Command Palette / Search Modal */}
      {globalSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setGlobalSearchOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[75vh]">
            <div className="flex items-center px-4 border-b border-slate-200">
              <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Type to search across Tasks, Trainers, and Drive folders..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full h-11 text-sm bg-transparent outline-none placeholder:text-slate-400 text-slate-800"
              />
              {query && (
                <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {!query && (
                <div className="text-center py-8 text-xs text-slate-400">
                  Search across all internal modules by name, topic, company, or category.
                </div>
              )}

              {query && totalResults === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  No records matching &quot;{query}&quot; found.
                </div>
              )}

              {/* Tasks results */}
              {filteredTasks.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
                    <CheckSquare className="h-3 w-3 text-blue-500" /> Tasks ({filteredTasks.length})
                  </div>
                  <div className="space-y-1">
                    {filteredTasks.map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setGlobalSearchOpen(false);
                          navigate('/tasks');
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-50 cursor-pointer text-xs group transition-colors"
                      >
                        <div className="font-medium text-slate-800 truncate">{t.title}</div>
                        <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-100">
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trainers results */}
              {filteredTrainers.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
                    <Users className="h-3 w-3 text-emerald-500" /> Trainers ({filteredTrainers.length})
                  </div>
                  <div className="space-y-1">
                    {filteredTrainers.map(tr => (
                      <div
                        key={tr.id}
                        onClick={() => {
                          setGlobalSearchOpen(false);
                          navigate('/trainers');
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-50 cursor-pointer text-xs group transition-colors"
                      >
                        <div>
                          <div className="font-medium text-slate-800">{tr.trainer_name}</div>
                          <div className="text-[10px] text-slate-400">{tr.company_name} • {tr.location}</div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {tr.experience} yrs exp
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drive results */}
              {filteredDrive.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
                    <FolderSync className="h-3 w-3 text-amber-500" /> Drive Folders ({filteredDrive.length})
                  </div>
                  <div className="space-y-1">
                    {filteredDrive.map(d => (
                      <div
                        key={d.id}
                        onClick={() => {
                          setGlobalSearchOpen(false);
                          navigate('/drive');
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-50 cursor-pointer text-xs group transition-colors"
                      >
                        <div className="truncate">
                          <div className="font-medium text-slate-800 truncate">{d.folder_name}</div>
                          <div className="text-[10px] text-slate-400">{d.category} • {d.department}</div>
                        </div>
                        <span className="text-[10px] text-blue-600 font-medium">View</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Navigate with arrow keys</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
