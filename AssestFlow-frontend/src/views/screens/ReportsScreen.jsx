import React from 'react';

export default function ReportsScreen({ analytics, departments, categories }) {
  if (!analytics) {
    return <div className="card-flow">No aggregated analytics dataset available. Check DB connection.</div>;
  }

  const maxDept = Math.max(...Object.values(analytics.deptAllocations || {}), 1);
  const maxMaint = Math.max(...Object.values(analytics.maintenanceFreq || {}), 1);
  const maxResource = Math.max(...Object.values(analytics.resourceUsage || {}), 1);
  const maxHeat = Math.max(...(analytics.bookingHeatmap || []), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="grid-kpi">
        <div className="kpi-card" style={{ flexGrow: 1 }}>
          <span className="kpi-title">Total Inventory Count</span>
          <span className="kpi-value">{analytics.totalAssets || 0}</span>
        </div>
        <div className="kpi-card" style={{ flexGrow: 1 }}>
          <span className="kpi-title">Allocated Assets</span>
          <span className="kpi-value">{analytics.statusCounts?.Allocated || 0}</span>
        </div>
        <div className="kpi-card" style={{ flexGrow: 1 }}>
          <span className="kpi-title">Overdue Return Alerts</span>
          <span className="kpi-value" style={{ color: 'var(--danger)' }}>
            {analytics.overdueCount || 0}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        <div className="card-flow">
          <h3>Asset Allocations by Department</h3>
          <div className="chart-bar-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
            {Object.entries(analytics.deptAllocations || {}).map(([deptName, val]) => {
              const pct = (val / maxDept) * 100;
              return (
                <div key={deptName} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>{deptName}</span>
                    <strong>{val} assets</strong>
                  </div>
                  <div style={{ background: 'var(--border-color)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--primary)', height: '100%', width: `${pct}%`, borderRadius: '5px', transition: 'width 0.6s ease' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-flow">
          <h3>Maintenance Defect Log Counts by Category</h3>
          <div className="chart-bar-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
            {Object.entries(analytics.maintenanceFreq || {}).map(([catName, val]) => {
              const pct = (val / maxMaint) * 100;
              return (
                <div key={catName} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>{catName}</span>
                    <strong>{val} requests</strong>
                  </div>
                  <div style={{ background: 'var(--border-color)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--warning-hover)', height: '100%', width: `${pct}%`, borderRadius: '5px', transition: 'width 0.6s ease' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        <div className="card-flow">
          <h3>Shared Resource Bookings Utilizations</h3>
          <div className="chart-bar-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
            {Object.entries(analytics.resourceUsage || {}).map(([resName, val]) => {
              const pct = (val / maxResource) * 100;
              return (
                <div key={resName} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>{resName}</span>
                    <strong>{val} slots booked</strong>
                  </div>
                  <div style={{ background: 'var(--border-color)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--success-hover)', height: '100%', width: `${pct}%`, borderRadius: '5px', transition: 'width 0.6s ease' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-flow">
          <h3>Peak Booking Calendar Load Heatmap (Hourly)</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Color intensity indicates high scheduling frequencies.
          </p>
          <div className="heatmap-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '6px' }}>
            {analytics.bookingHeatmap?.map((val, hour) => {
              let intensity = 'heat-0';
              if (val > 0) {
                const ratio = val / maxHeat;
                if (ratio > 0.75) intensity = 'heat-4-plus';
                else if (ratio > 0.50) intensity = 'heat-3';
                else if (ratio > 0.25) intensity = 'heat-2';
                else intensity = 'heat-1';
              }
              return (
                <div key={hour} className={`heatmap-cell ${intensity}`} title={`${hour}:00 - ${val} bookings`}>
                  <span style={{ fontSize: '9px', fontWeight: 'bold' }}>{hour}</span>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>({val})</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
