import React from 'react';

export default function NotificationsScreen({ currentUser, notifications, activityLogs, handleReadNotification }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
      
      <div className="card-flow">
        <h3>User Notifications & Alert Inbox</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          {notifications.map(notif => (
            <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '14px' }}>{notif.title}</strong>
                <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--text-muted)' }}>{notif.message}</p>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(notif.timestamp).toLocaleString()}</span>
              </div>
              {!notif.read && (
                <button className="btn btn-secondary btn-xs" onClick={() => handleReadNotification(notif.id)} style={{ alignSelf: 'center' }}>
                  Mark Read
                </button>
              )}
            </div>
          ))}
          {notifications.length === 0 && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No notifications in your inbox.</p>
          )}
        </div>
      </div>

      {(currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager') && (
        <div className="card-flow">
          <h3>System Audit Trail (Security Log)</h3>
          <div className="table-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <table className="table-flow">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><span style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString()}</span></td>
                    <td><strong>{log.userName}</strong> <span style={{ fontSize: '10px' }} className="badge role-employee">{log.userRole}</span></td>
                    <td><span className="badge status-available" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>{log.action}</span></td>
                    <td style={{ fontSize: '12px' }}>{log.details}</td>
                  </tr>
                ))}
                {activityLogs.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No audit trails recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
