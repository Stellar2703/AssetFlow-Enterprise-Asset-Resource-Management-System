import React from 'react';

export default function BookingsScreen({ currentUser, bookings, assets, setModalType, handleCancelBooking }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Bookable Assets list */}
      <div className="card-flow">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0 }}>Shared Bookable Resources</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setModalType('bookResource')}>
            📅 Book a Slot
          </button>
        </div>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px' }}>
          {assets.filter(a => a.sharedBookable).map(a => (
            <div key={a.id} className="kpi-card" style={{ flex: '0 0 250px', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a.tag}</span>
              <strong style={{ display: 'block', margin: '4px 0' }}>{a.name}</strong>
              <span className={`badge status-${a.lifecycleStatus.toLowerCase().replace(' ', '-')}`}>
                {a.lifecycleStatus}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Slots lists */}
      <div className="card-flow">
        <h3>Active Schedules & Reserved Slots</h3>
        <div className="table-container">
          <table className="table-flow">
            <thead>
              <tr>
                <th>Resource Name</th>
                <th>Booked By</th>
                <th>Department Representative</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td><strong>{b.resourceTag}</strong> - {b.resourceName}</td>
                  <td>{b.bookedByName}</td>
                  <td>{b.departmentName || 'N/A'}</td>
                  <td>{new Date(b.startTime).toLocaleString()}</td>
                  <td>{new Date(b.endTime).toLocaleString()}</td>
                  <td><span className={`badge status-${b.status.toLowerCase()}`}>{b.status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    {b.status !== 'Cancelled' && (currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager' || b.bookedById === currentUser?.id) && (
                      <button className="btn btn-danger btn-xs" onClick={() => handleCancelBooking(b.id)}>
                        Cancel Slot
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No bookings active.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
