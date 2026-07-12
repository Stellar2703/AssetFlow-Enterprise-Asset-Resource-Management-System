import React from 'react';

export default function DashboardScreen({ currentUser, assets, maintenanceRequests, bookings, transfers, getOverdueReturnItems, setModalType, setActiveTab }) {
  const overdueItems = getOverdueReturnItems();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <h2>Welcome to your Dashboard, {currentUser?.name} 👋</h2>
        <p>You have access to the system as a <strong>{currentUser?.role}</strong>.</p>
      </div>

      {/* Quick Action Grid */}
      <div className="grid-features">
        {(currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager') && (
          <div className="feature-card">
            <h3>💻 Register New Asset</h3>
            <p>Add a new device or furniture resource to the system catalog.</p>
            <button className="btn btn-primary" onClick={() => setModalType('registerAsset')}>
              Register Asset
            </button>
          </div>
        )}

        <div className="feature-card">
          <h3>📅 Book Shared Resource</h3>
          <p>Schedule a slot for a shared bookable boardroom or IT resource.</p>
          <button className="btn btn-primary" onClick={() => setModalType('bookResource')}>
            Book Slot
          </button>
        </div>

        <div className="feature-card">
          <h3>🔧 Raise Repair Ticket</h3>
          <p>File a repair request for hardware components showing faults.</p>
          <button className="btn btn-primary" onClick={() => setModalType('raiseMaintenance')}>
            File Ticket
          </button>
        </div>

        <div className="feature-card">
          <h3>📝 Audits & Verification</h3>
          <p>Inspect active inventory checksheets or review closed audit logs.</p>
          <button className="btn btn-primary" onClick={() => setActiveTab('audits')}>
            Go to Audits
          </button>
        </div>
      </div>

      {/* Overdue Return Alerts */}
      <div className="card-flow">
        <h3 style={{ marginBottom: '12px' }}>🚨 Overdue Return Warnings</h3>
        <div className="table-container">
          <table className="table-flow">
            <thead>
              <tr>
                <th>Tag</th>
                <th>Asset Name</th>
                <th>Assignee</th>
                <th>Expected Return Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {overdueItems.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.assetTag}</strong></td>
                  <td>{item.assetName}</td>
                  <td>{item.assigneeName}</td>
                  <td><span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{new Date(item.expectedReturnDate).toLocaleDateString()}</span></td>
                  <td><span className="badge status-lost">OVERDUE</span></td>
                </tr>
              ))}
              {overdueItems.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No overdue returns detected. Excellent job!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
