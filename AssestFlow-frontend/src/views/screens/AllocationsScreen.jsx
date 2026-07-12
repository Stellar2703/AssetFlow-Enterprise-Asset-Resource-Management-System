import React from 'react';

export default function AllocationsScreen(props) {
  const {
    currentUser,
    allocations,
    transfers,
    employees,
    assets,
    departments,
    allocationTab,
    setAllocationTab,
    handleResolveTransfer
  } = props;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div className="tab-menu" style={{ marginBottom: 0 }}>
        <button className={`tab-link ${allocationTab === 'allocations' ? 'active' : ''}`} onClick={() => setAllocationTab('allocations')}>
          🔗 Active Allocations
        </button>
        <button className={`tab-link ${allocationTab === 'transfers' ? 'active' : ''}`} onClick={() => setAllocationTab('transfers')}>
          ➡️ Transfer Requests ({transfers.filter(t => t.status === 'Pending').length})
        </button>
      </div>

      {allocationTab === 'allocations' && (
        <div className="card-flow">
          <h3>Active Allocation Logs ({allocations.length})</h3>
          <div className="table-container">
            <table className="table-flow">
              <thead>
                <tr>
                  <th>Asset Tag</th>
                  <th>Type</th>
                  <th>Assignee Target</th>
                  <th>Allocation Date</th>
                  <th>Expected Return</th>
                  <th>Return Condition</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map(al => {
                  const asset = assets.find(a => a.id === al.assetId);
                  const user = employees.find(e => e.id === al.allocatedToId);
                  const dept = departments.find(d => d.id === al.allocatedToId);
                  return (
                    <tr key={al.id}>
                      <td><strong>{asset ? asset.tag : 'AF-XXXX'}</strong> - {asset ? asset.name : 'Unknown'}</td>
                      <td>{al.allocatedToType}</td>
                      <td>{al.allocatedToType === 'Employee' ? (user ? user.name : 'Unknown Employee') : (dept ? dept.name : 'Unknown Department')}</td>
                      <td>{new Date(al.allocationDate).toLocaleDateString()}</td>
                      <td>{al.expectedReturnDate ? new Date(al.expectedReturnDate).toLocaleDateString() : 'N/A'}</td>
                      <td>{al.returnCondition || 'In Use'}</td>
                      <td><span className={`badge status-${al.status.toLowerCase()}`}>{al.status}</span></td>
                    </tr>
                  );
                })}
                {allocations.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No active allocations.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {allocationTab === 'transfers' && (
        <div className="card-flow">
          <h3>Inter-Employee Asset Transfer Requests ({transfers.length})</h3>
          <div className="table-container">
            <table className="table-flow">
              <thead>
                <tr>
                  <th>Asset Tag</th>
                  <th>Asset Name</th>
                  <th>From Assignee</th>
                  <th>To Recipient Target</th>
                  <th>Requested By</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map(tr => (
                  <tr key={tr.id}>
                    <td><strong>{tr.assetTag}</strong></td>
                    <td>{tr.assetName}</td>
                    <td>{tr.fromName}</td>
                    <td>{tr.toName}</td>
                    <td>{tr.requesterName}</td>
                    <td>{new Date(tr.requestedAt).toLocaleDateString()}</td>
                    <td><span className={`badge status-${tr.status.toLowerCase()}`}>{tr.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      {tr.status === 'Pending' && (
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button className="btn btn-primary btn-xs" onClick={() => handleResolveTransfer(tr.id, 'Approve')}>
                            Approve
                          </button>
                          <button className="btn btn-danger btn-xs" onClick={() => handleResolveTransfer(tr.id, 'Reject')}>
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {transfers.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No transfer requests filed.</td>
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
