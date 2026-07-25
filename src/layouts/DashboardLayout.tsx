import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  headerTitle?: string;
  headerAction?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebar,
  headerTitle,
  headerAction,
}) => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {(headerTitle || headerAction) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            {headerTitle && (
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {headerTitle}
              </h1>
            )}
            {headerAction && <div className="shrink-0">{headerAction}</div>}
          </div>
        )}

        <div className={`grid grid-cols-1 ${sidebar ? 'lg:grid-cols-12' : ''} gap-6`}>
          {sidebar && (
            <aside className="lg:col-span-3 space-y-4">
              {sidebar}
            </aside>
          )}

          <main className={sidebar ? 'lg:col-span-9' : 'w-full'}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
