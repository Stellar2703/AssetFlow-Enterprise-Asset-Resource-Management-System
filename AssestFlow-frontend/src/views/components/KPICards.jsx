import React from 'react';

export default function KPICards({ analytics, maintenanceRequests, bookings, transfers, overdueCount }) {
  if (!analytics) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
      <div className="bg-card-bg border border-border-color rounded-2xl p-5 flex flex-col gap-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Assets Available</span>
        <span className="text-3xl font-extrabold text-text-heading">{analytics.statusCounts?.Available || 0}</span>
      </div>
      
      <div className="bg-card-bg border border-border-color rounded-2xl p-5 flex flex-col gap-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Assets Allocated</span>
        <span className="text-3xl font-extrabold text-text-heading">{analytics.statusCounts?.Allocated || 0}</span>
      </div>
      
      <div className="bg-card-bg border border-border-color rounded-2xl p-5 flex flex-col gap-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Maintenance Tickets</span>
        <span className="text-3xl font-extrabold text-text-heading">{maintenanceRequests.filter(m => m.status !== 'Resolved').length}</span>
      </div>
      
      <div className="bg-card-bg border border-border-color rounded-2xl p-5 flex flex-col gap-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Bookings (Active)</span>
        <span className="text-3xl font-extrabold text-text-heading">{bookings.filter(b => b.status === 'Upcoming' || b.status === 'Ongoing').length}</span>
      </div>
      
      <div className="bg-card-bg border border-border-color rounded-2xl p-5 flex flex-col gap-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Pending Transfers</span>
        <span className="text-3xl font-extrabold text-text-heading">{transfers.filter(t => t.status === 'Pending').length}</span>
      </div>
      
      <div className="bg-card-bg border border-border-color rounded-2xl p-5 flex flex-col gap-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Overdue Returns</span>
        <span className={`text-3xl font-extrabold ${overdueCount > 0 ? 'text-danger' : 'text-text-heading'}`}>
          {overdueCount}
        </span>
      </div>
    </div>
  );
}
