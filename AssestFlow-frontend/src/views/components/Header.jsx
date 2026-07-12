import React from 'react';

export default function Header({ activeTab, currentUser, onSync }) {
  return (
    <div className="flex justify-between items-center pb-5 border-b border-border-color/60">
      <div className="flex flex-col text-left">
        <h1 className="text-3xl font-extrabold text-text-heading tracking-tight capitalize mb-1">
          {activeTab === 'org' ? 'Organization Setup' : activeTab}
        </h1>
        <p className="text-sm text-text-muted">
          Welcome, {currentUser?.name}. Manage and track organizational assets and resource schedules.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border-color bg-card-bg text-text-main text-xs font-bold hover:bg-body-bg hover:text-text-heading transition-all duration-200 cursor-pointer shadow-sm border-solid" 
          onClick={onSync}
        >
          🔄 Sync Data
        </button>
      </div>
    </div>
  );
}
