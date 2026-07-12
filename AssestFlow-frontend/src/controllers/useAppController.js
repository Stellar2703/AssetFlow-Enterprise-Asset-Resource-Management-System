import { useState, useEffect } from 'react';
import { getStoredToken, setStoredToken, clearStoredToken } from '../models/api';
import {
  AuthService, OrgService, AssetService, TransferService,
  BookingService, MaintenanceService, AuditService, NotificationService
} from '../models/services';

export function useAppController() {
  
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const [token, setToken] = useState(getStoredToken());
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); 
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  const [activeTab, setActiveTab] = useState('dashboard'); 
  
  const [orgTab, setOrgTab] = useState('departments'); 
  const [allocationTab, setAllocationTab] = useState('allocations'); 

  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [auditCycles, setAuditCycles] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [assetSearch, setAssetSearch] = useState({ q: '', categoryId: '', status: '', location: '' });

  const [toasts, setToasts] = useState([]);

  const [modalType, setModalType] = useState(null); 
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedAudit, setSelectedAudit] = useState(null);
  
  const [assetForm, setAssetForm] = useState({
    name: '', categoryId: '', serialNumber: '', acquisitionDate: '',
    acquisitionCost: '', condition: 'New', location: '', sharedBookable: false,
    customFieldValues: {}
  });
  const [allocationForm, setAllocationForm] = useState({ allocatedToType: 'Employee', allocatedToId: '', expectedReturnDate: '' });
  const [returnForm, setReturnForm] = useState({ condition: 'Good', notes: '' });
  const [bookingForm, setBookingForm] = useState({ resourceId: '', startTime: '', endTime: '', bookedForDepartmentId: '' });
  const [maintenanceForm, setMaintenanceForm] = useState({ assetId: '', description: '', priority: 'Medium' });
  const [transferForm, setTransferForm] = useState({ assetId: '', toEmployeeId: '', toDepartmentId: '', toType: 'Employee' });
  const [departmentForm, setDepartmentForm] = useState({ name: '', parentDepartmentId: '', headId: '', status: 'Active' });
  const [categoryForm, setCategoryForm] = useState({ name: '', customFields: [] });
  const [auditForm, setAuditForm] = useState({ name: '', scopeType: 'Department', scopeValue: '', startDate: '', endDate: '', auditorIds: [] });
  
  const [auditCheckAnswers, setAuditCheckAnswers] = useState({}); 

  const [syncTrigger, setSyncTrigger] = useState(0);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const addToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    if (token) {
      setStoredToken(token);
      AuthService.getMe(token)
        .then(data => {
          setCurrentUser(data.user);
          addToast(`Session loaded as: ${data.user.name}`);
        })
        .catch(() => {
          handleLogout();
        });
    } else {
      clearStoredToken();
      setCurrentUser(null);
    }
  }, [token]);

  useEffect(() => {
    if (currentUser) {
      loadAllData();
      const interval = setInterval(loadAllData, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser, assetSearch, syncTrigger]);

  const loadAllData = () => {
    Promise.all([
      AssetService.getAssets(assetSearch, token),
      OrgService.getDepartments(token),
      OrgService.getCategories(token),
      AuthService.getEmployees(token),
      BookingService.getBookings(token),
      MaintenanceService.getMaintenanceRequests(token),
      AuditService.getAudits(token),
      TransferService.getTransfers(token),
      NotificationService.getNotifications(token),
      NotificationService.getAnalytics(token),
      AssetService.getAllAllocations(token),
      ...(currentUser.role === 'Admin' || currentUser.role === 'Asset Manager' ? [NotificationService.getLogs(token)] : [])
    ]).then(([assetsData, deptsData, catsData, employeesData, bookingsData, maintenanceData, auditsData, transfersData, notificationsData, analyticsData, allocationsData, logsData]) => {
      setAssets(assetsData);
      setDepartments(deptsData);
      setCategories(catsData);
      setEmployees(employeesData);
      setBookings(bookingsData);
      setMaintenanceRequests(maintenanceData);
      setAuditCycles(auditsData);
      setTransfers(transfersData);
      setNotifications(notificationsData);
      setAnalytics(analyticsData);
      setAllocations(allocationsData);
      if (logsData) {
        setActivityLogs(logsData);
      }
    }).catch(err => {
      console.error('Error loading Master Data', err);
      
      if (token) {
        addToast('Connection sync issue: ' + err.message, 'error');
      }
    });
  };

  const handleLogout = () => {
    if (token) {
      AuthService.logout(token).catch(() => {});
    }
    setToken('');
    setCurrentUser(null);
    clearStoredToken();
    addToast('Session ended.', 'info');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'login') {
        const data = await AuthService.login(authForm.email, authForm.password);
        setToken(data.token);
      } else {
        const data = await AuthService.signup(authForm.name, authForm.email, authForm.password);
        addToast(data.message);
        setAuthMode('login');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handlePromote = async (employeeId, role, departmentId, status) => {
    try {
      await AuthService.promote(employeeId, role, departmentId, status, token);
      addToast('Employee roster updated.');
      loadAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      await OrgService.createDepartment(departmentForm, token);
      addToast('Department created.');
      setModalType(null);
      setDepartmentForm({ name: '', parentDepartmentId: '', headId: '', status: 'Active' });
      loadAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await OrgService.createCategory(categoryForm, token);
      addToast('Asset Category added.');
      setModalType(null);
      setCategoryForm({ name: '', customFields: [] });
      loadAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleRegisterAsset = async (e) => {
    e.preventDefault();
    try {
      await AssetService.registerAsset(assetForm, token);
      addToast('Asset registered.');
      setModalType(null);
      setAssetForm({
        name: '', categoryId: '', serialNumber: '', acquisitionDate: '',
        acquisitionCost: '', condition: 'New', location: '', sharedBookable: false,
        customFieldValues: {}
      });
      loadAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleAllocateAsset = async (e) => {
    e.preventDefault();
    try {
      await AssetService.allocateAsset(selectedAsset.id, allocationForm, token);
      addToast('Asset allocated.');
      setModalType(null);
      loadAllData();
    } catch (err) {
      if (err.message.includes('double-allocated')) {
        setTransferForm({
          assetId: selectedAsset.id,
          toEmployeeId: allocationForm.allocatedToType === 'Employee' ? allocationForm.allocatedToId : '',
          toDepartmentId: allocationForm.allocatedToType === 'Department' ? allocationForm.allocatedToId : '',
          toType: allocationForm.allocatedToType
        });
        setModalType('transferRequest');
      } else {
        addToast(err.message, 'error');
      }
    }
  };

  const handleReturnAsset = async (e) => {
    e.preventDefault();
    try {
      await AssetService.returnAsset(selectedAsset.id, returnForm, token);
      addToast('Asset returned.');
      setModalType(null);
      setReturnForm({ condition: 'Good', notes: '' });
      loadAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleRequestTransfer = async (e) => {
    e.preventDefault();
    try {
      await TransferService.requestTransfer({
        assetId: transferForm.assetId,
        toEmployeeId: transferForm.toType === 'Employee' ? transferForm.toEmployeeId : null,
        toDepartmentId: transferForm.toType === 'Department' ? transferForm.toDepartmentId : null
      }, token);
      addToast('Transfer request raised.');
      setModalType(null);
      loadAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleResolveTransfer = async (transferId, action) => {
    try {
      await TransferService.resolveTransfer(transferId, action, token);
      addToast(`Transfer ${action.toLowerCase()}d.`);
      loadAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      await BookingService.createBooking(bookingForm, token);
      addToast('Booking confirmed.');
      setModalType(null);
      setBookingForm({ resourceId: '', startTime: '', endTime: '', bookedForDepartmentId: '' });
      loadAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await BookingService.cancelBooking(bookingId, token);
      addToast('Booking cancelled.');
      loadAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleRaiseMaintenance = async (e) => {
    e.preventDefault();
    try {
      await MaintenanceService.createRequest(maintenanceForm, token);
      addToast('Repair ticket raised.');
      setModalType(null);
      setMaintenanceForm({ assetId: '', description: '', priority: 'Medium' });
      loadAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleApproveMaintenance = async (maintId) => {
    try {
      await MaintenanceService.approveRequest(maintId, token);
      addToast('Maintenance ticket approved.');
      loadAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleAssignTechnician = async (maintId, techName) => {
    if (!techName) return;
    try {
      await MaintenanceService.assignTechnician(maintId, techName, token);
      addToast('Technician assigned.');
      loadAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleResolveMaintenance = async (maintId, notes) => {
    try {
      await MaintenanceService.resolveRequest(maintId, notes, token);
      addToast('Maintenance resolved.');
      loadAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateAudit = async (e) => {
    e.preventDefault();
    try {
      await AuditService.createAudit(auditForm, token);
      addToast('Audit cycle created.');
      setModalType(null);
      setAuditForm({ name: '', scopeType: 'Department', scopeValue: '', startDate: '', endDate: '', auditorIds: [] });
      loadAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleLogAuditItem = async (auditId, assetId, status, notes) => {
    try {
      await AuditService.logAuditCheck(auditId, { assetId, status, notes }, token);
      addToast('Check logged.');
      loadAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCloseAudit = async (auditId) => {
    try {
      await AuditService.closeAudit(auditId, token);
      addToast('Audit cycle closed.');
      loadAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleReadNotification = async (id) => {
    try {
      await NotificationService.markRead(id, token);
      loadAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCategorySelectForAsset = (catId) => {
    const selected = categories.find(c => c.id === catId);
    if (selected) {
      const initialFields = {};
      selected.customFields.forEach(f => {
        initialFields[f.name] = '';
      });
      setAssetForm(prev => ({
        ...prev,
        categoryId: catId,
        customFieldValues: initialFields
      }));
    } else {
      setAssetForm(prev => ({ ...prev, categoryId: catId, customFieldValues: {} }));
    }
  };

  const handleOpenHistory = (asset) => {
    AssetService.getAssetHistory(asset.id, token)
      .then(data => {
        setSelectedAsset({ ...data.asset, history: data.history });
        setModalType('history');
      })
      .catch(() => {});
  };

  const getOverdueReturnItems = () => {
    const now = new Date();
    return allocations.filter(al => {
      if (al.status !== 'Active' || !al.expectedReturnDate) return false;
      return new Date(al.expectedReturnDate) < now;
    }).map(al => {
      const asset = assets.find(a => a.id === al.assetId);
      const user = employees.find(e => e.id === al.allocatedToId);
      const dept = departments.find(d => d.id === al.allocatedToId);
      return {
        ...al,
        assetTag: asset ? asset.tag : 'AF-XXXX',
        assetName: asset ? asset.name : 'Unknown',
        assigneeName: user ? user.name : (dept ? `${dept.name} (Dept)` : 'Unknown')
      };
    });
  };

  return {
    
    darkMode, setDarkMode,
    token, setToken,
    currentUser, setCurrentUser,
    authMode, setAuthMode,
    authForm, setAuthForm,
    activeTab, setActiveTab,
    orgTab, setOrgTab,
    allocationTab, setAllocationTab,
    assets, setAssets,
    departments, setDepartments,
    categories, setCategories,
    employees, setEmployees,
    bookings, setBookings,
    maintenanceRequests, setMaintenanceRequests,
    auditCycles, setAuditCycles,
    transfers, setTransfers,
    allocations, setAllocations,
    notifications, setNotifications,
    activityLogs, setActivityLogs,
    analytics, setAnalytics,
    assetSearch, setAssetSearch,
    toasts, setToasts,
    modalType, setModalType,
    selectedAsset, setSelectedAsset,
    selectedAudit, setSelectedAudit,
    
    assetForm, setAssetForm,
    allocationForm, setAllocationForm,
    returnForm, setReturnForm,
    bookingForm, setBookingForm,
    maintenanceForm, setMaintenanceForm,
    transferForm, setTransferForm,
    departmentForm, setDepartmentForm,
    categoryForm, setCategoryForm,
    auditForm, setAuditForm,
    auditCheckAnswers, setAuditCheckAnswers,
    
    syncTrigger, setSyncTrigger,
    loadAllData,
    
    handleLogout,
    handleAuthSubmit,
    handlePromote,
    handleCreateDepartment,
    handleCreateCategory,
    handleRegisterAsset,
    handleAllocateAsset,
    handleReturnAsset,
    handleRequestTransfer,
    handleResolveTransfer,
    handleCreateBooking,
    handleCancelBooking,
    handleRaiseMaintenance,
    handleApproveMaintenance,
    handleAssignTechnician,
    handleResolveMaintenance,
    handleCreateAudit,
    handleLogAuditItem,
    handleCloseAudit,
    handleReadNotification,
    handleCategorySelectForAsset,
    handleOpenHistory,
    getOverdueReturnItems,
    addToast
  };
}
