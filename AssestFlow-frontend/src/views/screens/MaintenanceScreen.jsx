import React from 'react';

export default function MaintenanceScreen(props) {
  const {
    currentUser,
    maintenanceRequests,
    employees,
    setModalType,
    handleApproveMaintenance,
    handleAssignTechnician,
    handleResolveMaintenance
  } = props;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card-flow">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0 }}>Maintenance Requests & Tickets</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setModalType('raiseMaintenance')}>
            🔧 Raise Repair Ticket
          </button>
        </div>

        <div className="table-container">
          <table className="table-flow">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Asset Name</th>
                <th>Priority</th>
                <th>Description</th>
                <th>Raised By</th>
                <th>Date Raised</th>
                <th>Technician Assigned</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceRequests.map(ticket => (
                <tr key={ticket.id}>
                  <td><strong>{ticket.assetTag}</strong></td>
                  <td>{ticket.assetName}</td>
                  <td><span className={`badge priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span></td>
                  <td>{ticket.description}</td>
                  <td>{ticket.requesterName}</td>
                  <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td>{ticket.technicianName || 'Unassigned'}</td>
                  <td><span className={`badge status-${ticket.status.toLowerCase().replace(' ', '-')}`}>{ticket.status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      {ticket.status === 'Pending' && (currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager') && (
                        <button className="btn btn-primary btn-xs" onClick={() => handleApproveMaintenance(ticket.id)}>
                          Approve
                        </button>
                      )}

                      {ticket.status === 'Approved' && (currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager') && (
                        <select
                          className="btn-select btn-xs"
                          defaultValue=""
                          onChange={e => handleAssignTechnician(ticket.id, e.target.value)}
                        >
                          <option value="" disabled>Assign Tech</option>
                          {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
                        </select>
                      )}

                      {(ticket.status === 'Approved' || ticket.status === 'Technician Assigned' || ticket.status === 'In Progress') && (
                        <button
                          className="btn btn-secondary btn-xs"
                          onClick={() => {
                            const notes = prompt('Enter resolution notes:');
                            if (notes) handleResolveMaintenance(ticket.id, notes);
                          }}
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {maintenanceRequests.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No maintenance requests filed.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
