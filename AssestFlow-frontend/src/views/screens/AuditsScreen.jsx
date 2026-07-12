import React from 'react';

export default function AuditsScreen(props) {
  const {
    currentUser,
    auditCycles,
    assets,
    setModalType,
    setSelectedAudit,
    handleCloseAudit,
    setAuditCheckAnswers
  } = props;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card-flow">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0 }}>Active and Closed Audit Cycles</h3>
          {currentUser?.role === 'Admin' && (
            <button className="btn btn-primary btn-sm" onClick={() => setModalType('createAudit')}>
              ➕ Create Audit Cycle
            </button>
          )}
        </div>

        <div className="table-container">
          <table className="table-flow">
            <thead>
              <tr>
                <th>Cycle Name</th>
                <th>Audit Scope</th>
                <th>Auditors</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {auditCycles.map(audit => (
                <tr key={audit.id}>
                  <td><strong>{audit.name}</strong></td>
                  <td><span className="badge role-employee">{audit.scopeName}</span></td>
                  <td>{audit.auditorNames}</td>
                  <td>{new Date(audit.startDate).toLocaleDateString()}</td>
                  <td>{new Date(audit.endDate).toLocaleDateString()}</td>
                  <td><span className={`badge status-${audit.status.toLowerCase()}`}>{audit.status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      {audit.status === 'Active' && (currentUser?.role === 'Admin' || audit.auditorIds.includes(currentUser?.id)) && (
                        <button
                          className="btn btn-primary btn-xs"
                          onClick={() => {
                            setSelectedAudit(audit);
                            
                            const initAnswers = {};
                            audit.auditItems?.forEach(item => {
                              initAnswers[item.assetId] = { status: item.status, notes: item.notes };
                            });
                            setAuditCheckAnswers(initAnswers);
                            setModalType('auditChecksheet');
                          }}
                        >
                          📋 Open Checksheet
                        </button>
                      )}

                      {audit.status === 'Active' && currentUser?.role === 'Admin' && (
                        <button className="btn btn-secondary btn-xs" onClick={() => handleCloseAudit(audit.id)}>
                          🔒 Close Cycle
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {auditCycles.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No audit cycles defined.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
