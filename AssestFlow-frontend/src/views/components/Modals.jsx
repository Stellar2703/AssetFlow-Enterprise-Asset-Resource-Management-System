import React from 'react';

export default function Modals(props) {
  const {
    modalType, setModalType,
    selectedAsset, setSelectedAsset,
    selectedAudit, setSelectedAudit,
    categories, departments, employees, assets,
    assetForm, setAssetForm, handleRegisterAsset, handleCategorySelectForAsset,
    allocationForm, setAllocationForm, handleAllocateAsset,
    returnForm, setReturnForm, handleReturnAsset,
    transferForm, setTransferForm, handleRequestTransfer,
    bookingForm, setBookingForm, handleCreateBooking,
    maintenanceForm, setMaintenanceForm, handleRaiseMaintenance,
    departmentForm, setDepartmentForm, handleCreateDepartment,
    categoryForm, setCategoryForm, handleCreateCategory,
    auditForm, setAuditForm, handleCreateAudit,
    auditCheckAnswers, setAuditCheckAnswers, handleLogAuditItem,
    currentUser
  } = props;

  if (!modalType) return null;

  const addFieldDescriptorToForm = () => {
    const nameInput = document.getElementById('field-name-desc');
    const labelInput = document.getElementById('field-label-desc');
    const typeInput = document.getElementById('field-type-desc');
    if (nameInput?.value && labelInput?.value) {
      const newField = {
        name: nameInput.value,
        label: labelInput.value,
        type: typeInput.value
      };
      setCategoryForm(prev => ({
        ...prev,
        customFields: [...prev.customFields, newField]
      }));
      nameInput.value = '';
      labelInput.value = '';
    }
  };

  return (
    <>
      {/* Register Asset Modal */}
      {modalType === 'registerAsset' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Register New Asset</h3>
              <button className="btn-icon" onClick={() => setModalType(null)}>&times;</button>
            </div>
            <form onSubmit={handleRegisterAsset}>
              <div className="form-group">
                <label>Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook Pro 16"
                  value={assetForm.name}
                  onChange={e => setAssetForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={assetForm.categoryId}
                    onChange={e => handleCategorySelectForAsset(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Serial Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SN-998822"
                    value={assetForm.serialNumber}
                    onChange={e => setAssetForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Acquisition Cost ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1500"
                    value={assetForm.acquisitionCost}
                    onChange={e => setAssetForm(prev => ({ ...prev, acquisitionCost: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Condition</label>
                  <select
                    value={assetForm.condition}
                    onChange={e => setAssetForm(prev => ({ ...prev, condition: e.target.value }))}
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Location / Room</label>
                <input
                  type="text"
                  placeholder="e.g. Room 405 HQ"
                  value={assetForm.location}
                  onChange={e => setAssetForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ flexDirection: 'row', gap: '12px', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  style={{ width: 'auto' }}
                  id="sharedBookable"
                  checked={assetForm.sharedBookable}
                  onChange={e => setAssetForm(prev => ({ ...prev, sharedBookable: e.target.checked }))}
                />
                <label htmlFor="sharedBookable">Mark as Shared / Bookable Resource (e.g. Meeting Room, Projector)</label>
              </div>

              {/* Dynamic custom fields */}
              {assetForm.categoryId && categories.find(c => c.id === assetForm.categoryId)?.customFields.map(f => (
                <div className="form-group" key={f.name}>
                  <label>{f.label}</label>
                  <input
                    type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                    value={assetForm.customFieldValues[f.name] || ''}
                    onChange={e => setAssetForm(prev => ({
                      ...prev,
                      customFieldValues: {
                        ...prev.customFieldValues,
                        [f.name]: e.target.value
                      }
                    }))}
                  />
                </div>
              ))}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Asset Modal */}
      {modalType === 'allocateAsset' && selectedAsset && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Allocate Asset: {selectedAsset.name} ({selectedAsset.tag})</h3>
              <button className="btn-icon" onClick={() => setModalType(null)}>&times;</button>
            </div>
            <form onSubmit={handleAllocateAsset}>
              <div className="form-group">
                <label>Allocation Target Type</label>
                <select
                  value={allocationForm.allocatedToType}
                  onChange={e => setAllocationForm(prev => ({ ...prev, allocatedToType: e.target.value, allocatedToId: '' }))}
                >
                  <option value="Employee">Employee Assignee</option>
                  <option value="Department">Department Assignee</option>
                </select>
              </div>

              <div className="form-group">
                <label>Assignee</label>
                {allocationForm.allocatedToType === 'Employee' ? (
                  <select
                    value={allocationForm.allocatedToId}
                    onChange={e => setAllocationForm(prev => ({ ...prev, allocatedToId: e.target.value }))}
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>)}
                  </select>
                ) : (
                  <select
                    value={allocationForm.allocatedToId}
                    onChange={e => setAllocationForm(prev => ({ ...prev, allocatedToId: e.target.value }))}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label>Expected Return Date (Optional)</label>
                <input
                  type="date"
                  value={allocationForm.expectedReturnDate}
                  onChange={e => setAllocationForm(prev => ({ ...prev, expectedReturnDate: e.target.value }))}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Allocate Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Asset Modal */}
      {modalType === 'returnAsset' && selectedAsset && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Asset Return: {selectedAsset.name}</h3>
              <button className="btn-icon" onClick={() => setModalType(null)}>&times;</button>
            </div>
            <form onSubmit={handleReturnAsset}>
              <div className="form-group">
                <label>Condition check-in</label>
                <select
                  value={returnForm.condition}
                  onChange={e => setReturnForm(prev => ({ ...prev, condition: e.target.value }))}
                >
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div className="form-group">
                <label>Condition Notes / Remarks</label>
                <textarea
                  placeholder="e.g. Slight scratches on cover, fully functioning."
                  value={returnForm.notes}
                  onChange={e => setReturnForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Approve Return</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Request Modal */}
      {modalType === 'transferRequest' && selectedAsset && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header" style={{ borderBottomColor: 'var(--warning)' }}>
              <h3 style={{ color: 'var(--warning-hover)' }}>⚠️ Asset Conflict: Raise Transfer Request</h3>
              <button className="btn-icon" onClick={() => setModalType(null)}>&times;</button>
            </div>
            <form onSubmit={handleRequestTransfer}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                This asset (<strong>{selectedAsset.tag}</strong> - {selectedAsset.name}) is currently taken. You cannot double-allocate a single asset.
              </p>
              
              <div className="form-group" style={{ marginTop: '14px' }}>
                <label>Do you wish to raise a Transfer Request instead?</label>
                <select
                  value={transferForm.toType}
                  onChange={e => setTransferForm(prev => ({ ...prev, toType: e.target.value, toEmployeeId: '', toDepartmentId: '' }))}
                >
                  <option value="Employee">Transfer to Employee</option>
                  <option value="Department">Transfer to Department</option>
                </select>
              </div>

              <div className="form-group">
                <label>Transfer Recipient</label>
                {transferForm.toType === 'Employee' ? (
                  <select
                    value={transferForm.toEmployeeId}
                    onChange={e => setTransferForm(prev => ({ ...prev, toEmployeeId: e.target.value }))}
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                  </select>
                ) : (
                  <select
                    value={transferForm.toDepartmentId}
                    onChange={e => setTransferForm(prev => ({ ...prev, toDepartmentId: e.target.value }))}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="btn btn-warning">Submit Transfer Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset History Modal */}
      {modalType === 'history' && selectedAsset && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Asset Timeline History: {selectedAsset.tag}</h3>
              <button className="btn-icon" onClick={() => setModalType(null)}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <strong>{selectedAsset.name}</strong> ({selectedAsset.categoryName})<br/>
                Status: <span className={`badge status-${selectedAsset.lifecycleStatus.toLowerCase().replace(' ', '-')}`}>{selectedAsset.lifecycleStatus}</span><br/>
                Current Location: {selectedAsset.location}
              </div>

              <div className="timeline">
                {selectedAsset.history?.map((hist, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className={`timeline-dot ${hist.type.toLowerCase()}`}></div>
                    <span className="timeline-meta">{new Date(hist.date).toLocaleString()}</span>
                    <span className="timeline-title">
                      {hist.type === 'Allocation' ? `Allocated to: ${hist.holder}` : `Maintenance: ${hist.status}`}
                    </span>
                    <p className="timeline-details">
                      {hist.type === 'Allocation' ? (
                        <>
                          {hist.status === 'Active' ? 'Active Allocation' : `Returned on ${new Date(hist.returnDate).toLocaleDateString()}`}.<br/>
                          Notes: {hist.notes || 'None'}
                        </>
                      ) : (
                        <>
                          Issue: {hist.description} (Priority: {hist.priority})<br/>
                          Tech: {hist.technician || 'None'}<br/>
                          Notes: {hist.resolvedNotes || 'In Progress'}
                        </>
                      )}
                    </p>
                  </div>
                ))}
                {(!selectedAsset.history || selectedAsset.history.length === 0) && (
                  <p style={{ color: 'var(--text-muted)' }}>No historical logs found for this asset.</p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalType(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Book Resource Modal */}
      {modalType === 'bookResource' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Book Shared Resource</h3>
              <button className="btn-icon" onClick={() => setModalType(null)}>&times;</button>
            </div>
            <form onSubmit={handleCreateBooking}>
              <div className="form-group">
                <label>Resource / Room</label>
                <select
                  value={bookingForm.resourceId}
                  onChange={e => setBookingForm(prev => ({ ...prev, resourceId: e.target.value }))}
                  required
                >
                  <option value="">Select Resource</option>
                  {assets.filter(a => a.sharedBookable).map(a => <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>)}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time (Date/Time)</label>
                  <input
                    type="datetime-local"
                    value={bookingForm.startTime}
                    onChange={e => setBookingForm(prev => ({ ...prev, startTime: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Time (Date/Time)</label>
                  <input
                    type="datetime-local"
                    value={bookingForm.endTime}
                    onChange={e => setBookingForm(prev => ({ ...prev, endTime: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {currentUser?.role === 'Department Head' && (
                <div className="form-group">
                  <label>Book on behalf of department (Optional)</label>
                  <select
                    value={bookingForm.bookedForDepartmentId}
                    onChange={e => setBookingForm(prev => ({ ...prev, bookedForDepartmentId: e.target.value }))}
                  >
                    <option value="">No, personal booking</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Raise Maintenance Modal */}
      {modalType === 'raiseMaintenance' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Raise Repair Ticket</h3>
              <button className="btn-icon" onClick={() => setModalType(null)}>&times;</button>
            </div>
            <form onSubmit={handleRaiseMaintenance}>
              <div className="form-group">
                <label>Select Asset</label>
                <select
                  value={maintenanceForm.assetId}
                  onChange={e => setMaintenanceForm(prev => ({ ...prev, assetId: e.target.value }))}
                  required
                >
                  <option value="">Select Asset</option>
                  {assets.map(a => <option key={a.id} value={a.id}>{a.tag} - {a.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={maintenanceForm.priority}
                  onChange={e => setMaintenanceForm(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label>Problem Description</label>
                <textarea
                  required
                  placeholder="Please specify issue details..."
                  value={maintenanceForm.description}
                  onChange={e => setMaintenanceForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">File Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {modalType === 'addDept' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Department</h3>
              <button className="btn-icon" onClick={() => setModalType(null)}>&times;</button>
            </div>
            <form onSubmit={handleCreateDepartment}>
              <div className="form-group">
                <label>Department Name</label>
                <input
                  type="text"
                  required
                  value={departmentForm.name}
                  onChange={e => setDepartmentForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Parent Department (Optional)</label>
                <select
                  value={departmentForm.parentDepartmentId}
                  onChange={e => setDepartmentForm(prev => ({ ...prev, parentDepartmentId: e.target.value }))}
                >
                  <option value="">No Parent Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Department Head (Optional)</label>
                <select
                  value={departmentForm.headId}
                  onChange={e => setDepartmentForm(prev => ({ ...prev, headId: e.target.value }))}
                >
                  <option value="">Select Department Head</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Department</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {modalType === 'addCategory' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Asset Category</h3>
              <button className="btn-icon" onClick={() => setModalType(null)}>&times;</button>
            </div>
            <form onSubmit={handleCreateCategory}>
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electronics, Vehicles"
                  value={categoryForm.name}
                  onChange={e => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-card" style={{ padding: '16px', background: 'var(--body-bg)', borderRadius: '8px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '13px', marginBottom: '8px' }}>Category-specific custom fields</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" id="field-name-desc" placeholder="Field name (e.g. warranty)" style={{ flexGrow: 1 }} />
                  <input type="text" id="field-label-desc" placeholder="Display label (e.g. Warranty)" style={{ flexGrow: 1 }} />
                  <select id="field-type-desc">
                    <option value="string">String/Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addFieldDescriptorToForm}>
                    Add
                  </button>
                </div>

                <div style={{ marginTop: '12px' }}>
                  {categoryForm.customFields.map((f, i) => (
                    <span key={i} className="badge role-employee" style={{ marginRight: '6px' }}>
                      {f.label} ({f.type})
                    </span>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Audit Cycle Modal */}
      {modalType === 'createAudit' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Audit Cycle</h3>
              <button className="btn-icon" onClick={() => setModalType(null)}>&times;</button>
            </div>
            <form onSubmit={handleCreateAudit}>
              <div className="form-group">
                <label>Audit Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Electronics Check"
                  value={auditForm.name}
                  onChange={e => setAuditForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Scope Type</label>
                  <select
                    value={auditForm.scopeType}
                    onChange={e => setAuditForm(prev => ({ ...prev, scopeType: e.target.value, scopeValue: '' }))}
                  >
                    <option value="All">All Assets</option>
                    <option value="Department">Department Scope</option>
                    <option value="Location">Location Scope</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Scope Value</label>
                  {auditForm.scopeType === 'Department' ? (
                    <select
                      value={auditForm.scopeValue}
                      onChange={e => setAuditForm(prev => ({ ...prev, scopeValue: e.target.value }))}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  ) : auditForm.scopeType === 'Location' ? (
                    <input
                      type="text"
                      placeholder="e.g. HQ Room 402"
                      value={auditForm.scopeValue}
                      onChange={e => setAuditForm(prev => ({ ...prev, scopeValue: e.target.value }))}
                      required
                    />
                  ) : (
                    <input type="text" disabled placeholder="All Scope" value="" />
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    required
                    value={auditForm.startDate}
                    onChange={e => setAuditForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    required
                    value={auditForm.endDate}
                    onChange={e => setAuditForm(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Assign Auditors</label>
                <select
                  multiple
                  required
                  style={{ height: '100px' }}
                  value={auditForm.auditorIds}
                  onChange={e => {
                    const ids = Array.from(e.target.selectedOptions, option => option.value);
                    setAuditForm(prev => ({ ...prev, auditorIds: ids }));
                  }}
                >
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>)}
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Cycle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auditor Checksheet Modal */}
      {modalType === 'auditChecksheet' && selectedAudit && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>Auditor Checksheet: {selectedAudit.name}</h3>
              <button className="btn-icon" onClick={() => setModalType(null)}>&times;</button>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Mark assets in scope. Flagging Missing or Damaged items logs discrepancy alerts.
            </p>

            <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="table-flow">
                <thead>
                  <tr>
                    <th>Tag</th>
                    <th>Asset Name</th>
                    <th>Acquisition / Serial</th>
                    <th>Verified State</th>
                    <th>Notes / Remarks</th>
                    <th>Save</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.filter(a => {
                    if (selectedAudit.scopeType === 'Department') return a.assignedToDepartmentId === selectedAudit.scopeValue || 
                      (a.assignedToEmployeeId && employees.find(e => e.id === a.assignedToEmployeeId)?.departmentId === selectedAudit.scopeValue);
                    if (selectedAudit.scopeType === 'Location') return a.location.toLowerCase() === selectedAudit.scopeValue.toLowerCase();
                    return true;
                  }).map(a => {
                    const savedItem = selectedAudit.auditItems.find(i => i.assetId === a.id);
                    const currentAnswers = auditCheckAnswers[a.id] || { status: savedItem?.status || 'Verified', notes: savedItem?.notes || '' };

                    return (
                      <tr key={a.id}>
                        <td><strong>{a.tag}</strong></td>
                        <td>{a.name}</td>
                        <td><code style={{ fontSize: '11px' }}>{a.serialNumber}</code></td>
                        <td>
                          <select 
                            value={currentAnswers.status}
                            onChange={e => {
                              const stat = e.target.value;
                              setAuditCheckAnswers(prev => ({
                                ...prev,
                                [a.id]: { ...currentAnswers, status: stat }
                              }));
                            }}
                          >
                            <option value="Verified">Verified</option>
                            <option value="Missing">Missing</option>
                            <option value="Damaged">Damaged</option>
                          </select>
                        </td>
                        <td>
                          <input 
                            type="text" 
                            placeholder="e.g. Ok"
                            value={currentAnswers.notes}
                            onChange={e => {
                              const note = e.target.value;
                              setAuditCheckAnswers(prev => ({
                                ...prev,
                                [a.id]: { ...currentAnswers, notes: note }
                              }));
                            }}
                          />
                        </td>
                        <td>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleLogAuditItem(selectedAudit.id, a.id, currentAnswers.status, currentAnswers.notes)}
                          >
                            💾
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalType(null)}>Close Checksheet</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
