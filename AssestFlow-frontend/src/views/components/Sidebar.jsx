import React from 'react';

export default function Sidebar({ activeTab, setActiveTab, currentUser, notificationsCount, darkMode, setDarkMode, onLogout }) {
  const roleColors = {
    'Admin': 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300',
    'Asset Manager': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300',
    'Department Head': 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300',
    'Employee': 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300'
  };

  const badgeClass = currentUser ? (roleColors[currentUser.role] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300') : '';

  const getNavItemClass = (tab) => {
    const base = "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-text-muted hover:bg-body-bg hover:text-text-heading transition-all duration-200 cursor-pointer w-full text-left border-none";
    const active = "bg-primary text-white hover:bg-primary-hover hover:text-white shadow-md shadow-primary/10";
    return `${base} ${activeTab === tab ? active : ''}`;
  };

  return (
    <aside className="w-[280px] bg-card-bg border-r border-border-color flex flex-col p-6 flex-shrink-0 transition-all duration-300">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-[38px] h-[38px] bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
          AF
        </div>
        <span className="text-2xl font-bold text-text-heading tracking-tight">AssetFlow</span>
      </div>

      {currentUser && (
        <div className="flex items-center gap-3 p-3 bg-body-bg rounded-xl mb-6 border border-border-color/10">
          <div className="w-[42px] h-[42px] rounded-full bg-primary text-white flex items-center justify-center font-bold text-base shadow-inner">
            {currentUser.name[0]}
          </div>
          <div className="flex flex-col overflow-hidden text-left">
            <span className="font-bold text-sm text-text-heading truncate leading-tight">{currentUser.name}</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide w-fit mt-1 border border-transparent ${badgeClass}`}>
              {currentUser.role}
            </span>
          </div>
        </div>
      )}

      <nav className="flex flex-col gap-1.5 flex-grow overflow-y-auto">
        <button className={getNavItemClass('dashboard')} onClick={() => setActiveTab('dashboard')}>
          🏢 Dashboard
        </button>
        <button className={getNavItemClass('assets')} onClick={() => setActiveTab('assets')}>
          💻 Assets Directory
        </button>
        <button className={getNavItemClass('allocations')} onClick={() => setActiveTab('allocations')}>
          🔗 Allocations & Transfers
        </button>
        <button className={getNavItemClass('bookings')} onClick={() => setActiveTab('bookings')}>
          📅 Bookings
        </button>
        <button className={getNavItemClass('maintenance')} onClick={() => setActiveTab('maintenance')}>
          🔧 Maintenance
        </button>
        <button className={getNavItemClass('audits')} onClick={() => setActiveTab('audits')}>
          📝 Audits
        </button>
        {(currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager') && (
          <button className={getNavItemClass('logs')} onClick={() => setActiveTab('logs')}>
            🪵 Activity Logs
          </button>
        )}
        {currentUser?.role === 'Admin' && (
          <button className={getNavItemClass('org')} onClick={() => setActiveTab('org')}>
            ⚙️ Organization Setup
          </button>
        )}
        <button className={getNavItemClass('reports')} onClick={() => setActiveTab('reports')}>
          📊 Reports & Charts
        </button>
        <button className={getNavItemClass('notifications')} onClick={() => setActiveTab('notifications')}>
          🔔 Notifications {notificationsCount > 0 && (
            <span className="ml-auto bg-danger text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {notificationsCount}
            </span>
          )}
        </button>
      </nav>

      <div className="mt-auto flex flex-col gap-2.5 pt-6 border-t border-border-color">
        <button 
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border-color bg-card-bg text-text-main text-sm font-bold hover:bg-body-bg transition-all duration-200 cursor-pointer" 
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
        <button 
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-danger text-white text-sm font-bold hover:bg-danger-hover transition-all duration-200 cursor-pointer border-none" 
          onClick={onLogout}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
