import React from 'react';

export default function AssetsScreen(props) {
  const {
    currentUser,
    assets,
    categories,
    assetSearch,
    setAssetSearch,
    setModalType,
    setSelectedAsset,
    handleOpenHistory,
    setAllocationForm
  } = props;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div className="card-flow filter-panel">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <input
            type="text"
            placeholder="Search assets by tag, serial, name, room..."
            value={assetSearch.q}
            onChange={e => setAssetSearch(prev => ({ ...prev, q: e.target.value }))}
            style={{ flexGrow: 2 }}
          />

          <select
            value={assetSearch.categoryId}
            onChange={e => setAssetSearch(prev => ({ ...prev, categoryId: e.target.value }))}
            style={{ flexGrow: 1 }}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select
            value={assetSearch.status}
            onChange={e => setAssetSearch(prev => ({ ...prev, status: e.target.value }))}
            style={{ flexGrow: 1 }}
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Allocated">Allocated</option>
            <option value="Reserved">Reserved</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Lost">Lost</option>
            <option value="Retired">Retired</option>
            <option value="Disposed">Disposed</option>
          </select>

          <input
            type="text"
            placeholder="Location filter"
            value={assetSearch.location}
            onChange={e => setAssetSearch(prev => ({ ...prev, location: e.target.value }))}
            style={{ flexGrow: 1 }}
          />
        </div>
      </div>

      <div className="card-flow">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0 }}>Registered Assets ({assets.length})</h3>
          {(currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager') && (
            <button className="btn btn-primary btn-sm" onClick={() => setModalType('registerAsset')}>
              ➕ Register Asset
            </button>
          )}
        </div>

        <div className="table-container">
          <table className="table-flow">
            <thead>
              <tr>
                <th>Tag</th>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Serial Number</th>
                <th>Acquisition Date</th>
                <th>Cost ($)</th>
                <th>Condition</th>
                <th>Location</th>
                <th>Status</th>
                <th>Assignee</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(asset => (
                <tr key={asset.id}>
                  <td><strong>{asset.tag}</strong></td>
                  <td>{asset.name} {asset.sharedBookable && <span className="badge role-employee" style={{ fontSize: '10px', background: 'var(--primary-subtle)', color: 'var(--primary-hover)' }}>SHARED</span>}</td>
                  <td>{asset.categoryName}</td>
                  <td><code style={{ fontSize: '11px' }}>{asset.serialNumber}</code></td>
                  <td>{asset.acquisitionDate}</td>
                  <td>{parseFloat(asset.acquisitionCost).toLocaleString()}</td>
                  <td><span className={`badge condition-${asset.condition.toLowerCase()}`}>{asset.condition}</span></td>
                  <td>{asset.location}</td>
                  <td><span className={`badge status-${asset.lifecycleStatus.toLowerCase().replace(' ', '-')}`}>{asset.lifecycleStatus}</span></td>
                  <td>{asset.assigneeName || 'None'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button className="btn btn-secondary btn-xs" onClick={() => handleOpenHistory(asset)}>
                        📜 History
                      </button>

                      {(currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager') && (
                        <>
                          {asset.lifecycleStatus === 'Available' ? (
                            <button
                              className="btn btn-primary btn-xs"
                              onClick={() => {
                                setSelectedAsset(asset);
                                setAllocationForm({ allocatedToType: 'Employee', allocatedToId: '', expectedReturnDate: '' });
                                setModalType('allocateAsset');
                              }}
                            >
                              🔗 Allocate
                            </button>
                          ) : asset.lifecycleStatus === 'Allocated' ? (
                            <>
                              <button
                                className="btn btn-secondary btn-xs"
                                onClick={() => {
                                  setSelectedAsset(asset);
                                  setModalType('returnAsset');
                                }}
                              >
                                📥 Return
                              </button>
                              <button
                                className="btn btn-warning btn-xs"
                                onClick={() => {
                                  setSelectedAsset(asset);
                                  setModalType('transferRequest');
                                }}
                              >
                                ➡️ Transfer
                              </button>
                            </>
                          ) : null}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No assets found. Try adjusting filters or register new items.
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
