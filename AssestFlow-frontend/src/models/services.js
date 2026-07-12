import { fetchApi } from './api';

export const AuthService = {
  login: async (email, password) => {
    return fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  signup: async (name, email, password) => {
    return fetchApi('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },

  logout: async (token) => {
    return fetchApi('/auth/logout', { method: 'POST' }, token);
  },

  getMe: async (token) => {
    return fetchApi('/auth/me', {}, token);
  },

  getEmployees: async (token) => {
    return fetchApi('/employees', {}, token);
  },

  promote: async (employeeId, role, departmentId, status, token) => {
    return fetchApi('/employees/promote', {
      method: 'POST',
      body: JSON.stringify({ employeeId, role, departmentId, status })
    }, token);
  }
};

export const OrgService = {
  getDepartments: async (token) => {
    return fetchApi('/org/departments', {}, token);
  },

  createDepartment: async (deptData, token) => {
    return fetchApi('/org/departments', {
      method: 'POST',
      body: JSON.stringify(deptData)
    }, token);
  },

  updateDepartment: async (id, deptData, token) => {
    return fetchApi(`/org/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(deptData)
    }, token);
  },

  getCategories: async (token) => {
    return fetchApi('/org/categories', {}, token);
  },

  createCategory: async (catData, token) => {
    return fetchApi('/org/categories', {
      method: 'POST',
      body: JSON.stringify(catData)
    }, token);
  },

  updateCategory: async (id, catData, token) => {
    return fetchApi(`/org/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(catData)
    }, token);
  }
};

export const AssetService = {
  getAssets: async (filters = {}, token) => {
    const query = new URLSearchParams();
    if (filters.q) query.append('q', filters.q);
    if (filters.categoryId) query.append('categoryId', filters.categoryId);
    if (filters.status) query.append('status', filters.status);
    if (filters.location) query.append('location', filters.location);

    return fetchApi(`/assets?${query.toString()}`, {}, token);
  },

  registerAsset: async (assetData, token) => {
    return fetchApi('/assets', {
      method: 'POST',
      body: JSON.stringify(assetData)
    }, token);
  },

  getAssetHistory: async (id, token) => {
    return fetchApi(`/assets/${id}/history`, {}, token);
  },

  allocateAsset: async (id, allocData, token) => {
    return fetchApi(`/assets/${id}/allocate`, {
      method: 'POST',
      body: JSON.stringify(allocData)
    }, token);
  },

  returnAsset: async (id, returnData, token) => {
    return fetchApi(`/assets/${id}/return`, {
      method: 'POST',
      body: JSON.stringify(returnData)
    }, token);
  },

  getAllAllocations: async (token) => {
    return fetchApi('/allocations', {}, token);
  }
};

export const TransferService = {
  getTransfers: async (token) => {
    return fetchApi('/transfers', {}, token);
  },

  requestTransfer: async (transferData, token) => {
    return fetchApi('/transfers', {
      method: 'POST',
      body: JSON.stringify(transferData)
    }, token);
  },

  resolveTransfer: async (id, action, token) => {
    return fetchApi(`/transfers/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ action })
    }, token);
  }
};

export const BookingService = {
  getBookings: async (token) => {
    return fetchApi('/bookings', {}, token);
  },

  createBooking: async (bookingData, token) => {
    return fetchApi('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    }, token);
  },

  cancelBooking: async (id, token) => {
    return fetchApi(`/bookings/${id}/cancel`, { method: 'POST' }, token);
  }
};

export const MaintenanceService = {
  getMaintenanceRequests: async (token) => {
    return fetchApi('/maintenance', {}, token);
  },

  createRequest: async (maintData, token) => {
    return fetchApi('/maintenance', {
      method: 'POST',
      body: JSON.stringify(maintData)
    }, token);
  },

  approveRequest: async (id, token) => {
    return fetchApi(`/maintenance/${id}/approve`, { method: 'POST' }, token);
  },

  assignTechnician: async (id, technicianName, token) => {
    return fetchApi(`/maintenance/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ technicianName })
    }, token);
  },

  resolveRequest: async (id, notes, token) => {
    return fetchApi(`/maintenance/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    }, token);
  }
};

export const AuditService = {
  getAudits: async (token) => {
    return fetchApi('/audits', {}, token);
  },

  createAudit: async (auditData, token) => {
    return fetchApi('/audits', {
      method: 'POST',
      body: JSON.stringify(auditData)
    }, token);
  },

  logAuditCheck: async (auditId, checkData, token) => {
    return fetchApi(`/audits/${auditId}/check`, {
      method: 'POST',
      body: JSON.stringify(checkData)
    }, token);
  },

  closeAudit: async (id, token) => {
    return fetchApi(`/audits/${id}/close`, { method: 'POST' }, token);
  }
};

export const NotificationService = {
  getNotifications: async (token) => {
    return fetchApi('/notifications', {}, token);
  },

  markRead: async (id, token) => {
    return fetchApi(`/notifications/${id}/read`, { method: 'POST' }, token);
  },

  getLogs: async (token) => {
    return fetchApi('/logs', {}, token);
  },

  getAnalytics: async (token) => {
    return fetchApi('/analytics', {}, token);
  }
};
