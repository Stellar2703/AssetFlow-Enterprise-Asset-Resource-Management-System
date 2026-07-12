import React from 'react';

export default function OrgScreen(props) {
  const {
    currentUser,
    departments,
    categories,
    employees,
    orgTab,
    setOrgTab,
    setModalType,
    handlePromote
  } = props;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Sub tabs nav */}
      <div className="tab-menu" style={{ marginBottom: 0 }}>
        <button className={`tab-link ${orgTab === 'departments' ? 'active' : ''}`} onClick={() => setOrgTab('departments')}>
          🏢 Departments
        </button>
        <button className={`tab-link ${orgTab === 'categories' ? 'active' : ''}`} onClick={() => setOrgTab('categories')}>
          📂 Asset Categories
        </button>
        <button className={`tab-link ${orgTab === 'directory' ? 'active' : ''}`} onClick={() => setOrgTab('directory')}>
          👥 Employee Directory
        </button>
      </div>

      {/* Departments view */}
      {orgTab === 'departments' && (
        <div className="card-flow">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0 }}>Organization Departments</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setModalType('addDept')}>
              ➕ Add Department
            </button>
          </div>
          <div className="table-container">
            <table className="table-flow">
              <thead>
                <tr>
                  <th>Department ID</th>
                  <th>Department Name</th>
                  <th>Department Head</th>
                  <th>Parent Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {departments.map(dept => {
                  const parent = departments.find(d => d.id === dept.parentDepartmentId);
                  const head = employees.find(e => e.id === dept.headId);
                  return (
                    <tr key={dept.id}>
                      <td><code>{dept.id}</code></td>
                      <td><strong>{dept.name}</strong></td>
                      <td>{head ? head.name : 'No assigned head'}</td>
                      <td>{parent ? parent.name : 'N/A'}</td>
                      <td><span className={`badge status-${dept.status.toLowerCase()}`}>{dept.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {orgTab === 'categories' && (
        <div className="card-flow">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0 }}>Asset Custom Configurations</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setModalType('addCategory')}>
              ➕ Add Category
            </button>
          </div>
          <div className="table-container">
            <table className="table-flow">
              <thead>
                <tr>
                  <th>Category ID</th>
                  <th>Category Name</th>
                  <th>Custom parameter descriptors</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td><code>{cat.id}</code></td>
                    <td><strong>{cat.name}</strong></td>
                    <td>
                      {cat.customFields?.map((f, i) => (
                        <span key={i} className="badge role-employee" style={{ marginRight: '6px' }}>
                          {f.label} ({f.type})
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {orgTab === 'directory' && (
        <div className="card-flow">
          <h3>Employee Roster</h3>
          <div className="table-container">
            <table className="table-flow">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Promotion Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td><strong>{emp.name}</strong></td>
                    <td>{emp.email}</td>
                    <td><span className="badge role-employee">{emp.role}</span></td>
                    <td>{emp.departmentName}</td>
                    <td>
                      {currentUser?.role === 'Admin' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <select
                            className="btn-select btn-xs"
                            value={emp.role}
                            onChange={e => handlePromote(emp.id, e.target.value, emp.departmentId, emp.status)}
                          >
                            <option value="Employee">Employee</option>
                            <option value="Asset Manager">Asset Manager</option>
                            <option value="Department Head">Department Head</option>
                            <option value="Admin">Admin</option>
                          </select>

                          <select
                            className="btn-select btn-xs"
                            value={emp.departmentId || ''}
                            onChange={e => handlePromote(emp.id, emp.role, e.target.value || null, emp.status)}
                          >
                            <option value="">No Department</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>

                          <select
                            className="btn-select btn-xs"
                            value={emp.status}
                            onChange={e => handlePromote(emp.id, emp.role, emp.departmentId, e.target.value)}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
