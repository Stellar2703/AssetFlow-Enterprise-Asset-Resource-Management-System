import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KPICards from './components/KPICards';
import Modals from './components/Modals';

// Import Screens
import DashboardScreen from './screens/DashboardScreen';
import AssetsScreen from './screens/AssetsScreen';
import AllocationsScreen from './screens/AllocationsScreen';
import BookingsScreen from './screens/BookingsScreen';
import MaintenanceScreen from './screens/MaintenanceScreen';
import AuditsScreen from './screens/AuditsScreen';
import OrgScreen from './screens/OrgScreen';
import ReportsScreen from './screens/ReportsScreen';
import NotificationsScreen from './screens/NotificationsScreen';

export default function AppLayout({ controller }) {
  const {
    activeTab, setActiveTab,
    currentUser,
    notifications,
    darkMode, setDarkMode,
    handleLogout,
    loadAllData,
    analytics,
    maintenanceRequests,
    bookings,
    transfers,
    getOverdueReturnItems,
    modalType, setModalType,
    orgTab, setOrgTab,
    allocationTab, setAllocationTab,
    assets, categories, employees, departments, allocations, activityLogs, auditCycles,
    assetSearch, setAssetSearch, setSelectedAsset, setSelectedAudit,
    assetForm, setAssetForm, handleRegisterAsset, handleCategorySelectForAsset,
    allocationForm, setAllocationForm, handleAllocateAsset,
    returnForm, setReturnForm, handleReturnAsset,
    transferForm, setTransferForm, handleRequestTransfer,
    handleResolveTransfer,
    handlePromote,
    bookingForm, setBookingForm, handleCreateBooking,
    maintenanceForm, setMaintenanceForm, handleRaiseMaintenance,
    departmentForm, setDepartmentForm, handleCreateDepartment,
    categoryForm, setCategoryForm, handleCreateCategory,
    auditForm, setAuditForm, handleCreateAudit,
    auditCheckAnswers, setAuditCheckAnswers, handleLogAuditItem,
    handleApproveMaintenance, handleAssignTechnician, handleResolveMaintenance,
    handleCancelBooking, handleCloseAudit, handleReadNotification,
    handleOpenHistory, selectedAsset, selectedAudit
  } = controller;

  const overdueCount = analytics?.overdueCount || 0;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-row w-full min-h-screen bg-body-bg text-text-main transition-colors duration-300">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        notificationsCount={unreadNotificationsCount}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={handleLogout}
      />

      {/* Main page panel */}
      <main className="flex-grow p-10 overflow-y-auto flex flex-col gap-8 max-w-[calc(100%-280px)]">
        <Header
          activeTab={activeTab}
          currentUser={currentUser}
          onSync={loadAllData}
        />

        {/* Global stats metrics row (hidden on notifications/setup to avoid layout noise) */}
        {activeTab !== 'notifications' && activeTab !== 'org' && (
          <KPICards
            analytics={analytics}
            maintenanceRequests={maintenanceRequests}
            bookings={bookings}
            transfers={transfers}
            overdueCount={overdueCount}
          />
        )}

        {/* Render Tab Screens */}
        <div className="w-full flex-grow">
          {activeTab === 'dashboard' && (
            <DashboardScreen
              currentUser={currentUser}
              assets={assets}
              maintenanceRequests={maintenanceRequests}
              bookings={bookings}
              transfers={transfers}
              getOverdueReturnItems={getOverdueReturnItems}
              setModalType={setModalType}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'assets' && (
            <AssetsScreen
              currentUser={currentUser}
              assets={assets}
              categories={categories}
              assetSearch={assetSearch}
              setAssetSearch={setAssetSearch}
              setModalType={setModalType}
              setSelectedAsset={setSelectedAsset}
              handleOpenHistory={handleOpenHistory}
              setAllocationForm={setAllocationForm}
            />
          )}

          {activeTab === 'allocations' && (
            <AllocationsScreen
              currentUser={currentUser}
              allocations={allocations}
              transfers={transfers}
              employees={employees}
              assets={assets}
              departments={departments}
              allocationTab={allocationTab}
              setAllocationTab={setAllocationTab}
              handleResolveTransfer={handleResolveTransfer}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingsScreen
              currentUser={currentUser}
              bookings={bookings}
              assets={assets}
              setModalType={setModalType}
              handleCancelBooking={handleCancelBooking}
            />
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceScreen
              currentUser={currentUser}
              maintenanceRequests={maintenanceRequests}
              employees={employees}
              setModalType={setModalType}
              handleApproveMaintenance={handleApproveMaintenance}
              handleAssignTechnician={handleAssignTechnician}
              handleResolveMaintenance={handleResolveMaintenance}
            />
          )}

          {activeTab === 'audits' && (
            <AuditsScreen
              currentUser={currentUser}
              auditCycles={auditCycles}
              assets={assets}
              setModalType={setModalType}
              setSelectedAudit={setSelectedAudit}
              handleCloseAudit={handleCloseAudit}
              setAuditCheckAnswers={setAuditCheckAnswers}
            />
          )}

          {activeTab === 'org' && (
            <OrgScreen
              currentUser={currentUser}
              departments={departments}
              categories={categories}
              employees={employees}
              orgTab={orgTab}
              setOrgTab={setOrgTab}
              setModalType={setModalType}
              handlePromote={handlePromote}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsScreen
              analytics={analytics}
              departments={departments}
              categories={categories}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsScreen
              currentUser={currentUser}
              notifications={notifications}
              activityLogs={activityLogs}
              handleReadNotification={handleReadNotification}
            />
          )}
        </div>
      </main>

      {/* Render Modals overlays */}
      <Modals
        modalType={modalType}
        setModalType={setModalType}
        selectedAsset={selectedAsset}
        setSelectedAsset={setSelectedAsset}
        selectedAudit={selectedAudit}
        setSelectedAudit={setSelectedAudit}
        categories={categories}
        departments={departments}
        employees={employees}
        assets={assets}
        assetForm={assetForm}
        setAssetForm={setAssetForm}
        handleRegisterAsset={handleRegisterAsset}
        handleCategorySelectForAsset={handleCategorySelectForAsset}
        allocationForm={allocationForm}
        setAllocationForm={setAllocationForm}
        handleAllocateAsset={handleAllocateAsset}
        returnForm={returnForm}
        setReturnForm={setReturnForm}
        handleReturnAsset={handleReturnAsset}
        transferForm={transferForm}
        setTransferForm={setTransferForm}
        handleRequestTransfer={handleRequestTransfer}
        bookingForm={bookingForm}
        setBookingForm={setBookingForm}
        handleCreateBooking={handleCreateBooking}
        maintenanceForm={maintenanceForm}
        setMaintenanceForm={setMaintenanceForm}
        handleRaiseMaintenance={handleRaiseMaintenance}
        departmentForm={departmentForm}
        setDepartmentForm={setDepartmentForm}
        handleCreateDepartment={handleCreateDepartment}
        categoryForm={categoryForm}
        setCategoryForm={setCategoryForm}
        handleCreateCategory={handleCreateCategory}
        auditForm={auditForm}
        setAuditForm={setAuditForm}
        handleCreateAudit={handleCreateAudit}
        auditCheckAnswers={auditCheckAnswers}
        setAuditCheckAnswers={setAuditCheckAnswers}
        handleLogAuditItem={handleLogAuditItem}
        currentUser={currentUser}
      />
    </div>
  );
}
