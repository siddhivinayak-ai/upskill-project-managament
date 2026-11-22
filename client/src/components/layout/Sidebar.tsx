import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  FolderSync, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Layers,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { getCurrentUser, getEmployees, setCurrentUser, subscribeToStore } from '../../lib/mockStore';
import { Employee } from '../../types';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [currentUser, setCurrentUserState] = useState<Employee>(getCurrentUser());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    getEmployees().then(setEmployees);
    const unsub = subscribeToStore('businessflow_current_user_v1', () => {
      setCurrentUserState(getCurrentUser());
    });
    return unsub;
  }, []);

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/tasks',
      label: 'Tasks',
      icon: CheckSquare,
      badge: 'Active',
    },
    {
      to: '/trainers',
      label: 'Trainers',
      icon: Users,
      badge: 'Master',
    },
    {
      to: '/drive',
      label: 'Drive Registry',
      icon: FolderSync,
      badge: null,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-slate-200 bg-white transition-all duration-300 z-30 select-none h-screen shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shrink-0">
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                BusinessFlow
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-1">
                Ops & Workflows
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Layers className="h-4 w-4" />
          </div>
        )}

        <button
          onClick={onToggle}
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-xs',
            collapsed && 'hidden'
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
            {!collapsed && (
              <div className="flex flex-1 items-center justify-between">
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {item.badge}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </div>

      {/* Collapsed Toggle Button when collapsed */}
      {collapsed && (
        <div className="p-2 border-t border-slate-100">
          <button
            onClick={onToggle}
            className="w-full flex h-8 items-center justify-center rounded-md hover:bg-slate-100 text-slate-500"
            title="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Current User Switcher Footer */}
      <div className="border-t border-slate-200 p-2 relative bg-slate-50/70">
        <div
          onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          className={cn(
            'flex items-center gap-2.5 rounded-lg p-2 text-left cursor-pointer hover:bg-white hover:shadow-xs border border-transparent hover:border-slate-200 transition-all',
            collapsed ? 'justify-center' : 'justify-between'
          )}
          title={`Active User: ${currentUser.name}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-white font-semibold text-xs shrink-0 shadow-xs"
              style={{ backgroundColor: currentUser.color || '#2563eb' }}
            >
              {currentUser.name.charAt(0)}
            </div>
            {!collapsed && (
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-800 truncate leading-none">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-1">
                  {currentUser.role}
                </div>
              </div>
            )}
          </div>
          {!collapsed && <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
        </div>

        {/* User Switcher Dropdown */}
        {userDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setUserDropdownOpen(false)}
            />
            <div className="absolute bottom-full left-2 mb-2 w-56 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl z-50">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Team Member
              </div>
              {employees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => {
                    setCurrentUser(emp.id);
                    setUserDropdownOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-left transition-colors',
                    emp.id === currentUser.id
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  )}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: emp.color }}
                  />
                  <div className="truncate">
                    <div className="truncate">{emp.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{emp.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
