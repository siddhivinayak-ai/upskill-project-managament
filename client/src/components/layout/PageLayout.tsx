import React from 'react';

interface PageLayoutProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PageLayout({ title, description, actions, children }: PageLayoutProps) {
  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#eef2f7]">
      {/* Top Banner */}
      <div className="border-b border-[#cbd5e1] bg-white px-5 py-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-[16px] font-bold leading-5 text-[#26384a]">{title}</h1>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
        </div>
      </div>

      {/* Main Page Area - Normal flowing layout, no flex squishing */}
      <div className="p-4 space-y-4">
        {children}
      </div>
    </div>
  );
}
