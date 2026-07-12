import React from 'react';
import { useAppController } from './controllers/useAppController';
import LoginScreen from './views/screens/LoginScreen';
import AppLayout from './views/AppLayout';
import ToastList from './views/components/ToastList';

function App() {
  const controller = useAppController();
  const { currentUser, token, authMode, setAuthMode, authForm, setAuthForm, handleAuthSubmit, toasts } = controller;

  if (token && !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-body-bg text-text-main">
        <div className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center bg-primary text-white font-bold text-lg animate-spin">
            AF
          </div>
          <h3 className="text-lg font-semibold text-text-heading">Restoring Secure Session...</h3>
          <p className="text-text-muted text-xs mt-1">Verifying security profile credentials with MySQL</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentUser ? (
        <AppLayout controller={controller} />
      ) : (
        <LoginScreen
          authMode={authMode}
          setAuthMode={setAuthMode}
          authForm={authForm}
          setAuthForm={setAuthForm}
          onSubmit={handleAuthSubmit}
        />
      )}
      
      <ToastList
        toasts={toasts}
        onClose={(id) => controller.setToasts(prev => prev.filter(t => t.id !== id))}
      />
    </>
  );
}

export default App;
