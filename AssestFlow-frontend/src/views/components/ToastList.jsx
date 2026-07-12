import React from 'react';

export default function ToastList({ toasts, onClose }) {
  if (toasts.length === 0) return null;

  const typeClasses = {
    success: 'bg-green-600 text-white shadow-green-500/20',
    error: 'bg-danger text-white shadow-danger/20',
    warning: 'bg-warning text-white shadow-warning/20',
    info: 'bg-info text-white shadow-info/20'
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2.5 z-50 max-w-sm w-[90%] md:w-full">
      {toasts.map(toast => {
        const cardClass = typeClasses[toast.type] || typeClasses.success;
        return (
          <div 
            key={toast.id} 
            className={`flex items-center justify-between p-4 rounded-xl shadow-lg text-sm font-semibold transition-all duration-300 animate-slide-in border-none ${cardClass}`}
          >
            <span className="flex-grow mr-4 text-left">{toast.message}</span>
            <button 
              className="text-white hover:text-white/80 font-bold bg-transparent border-none text-lg cursor-pointer p-0 leading-none" 
              onClick={() => onClose(toast.id)}
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
}
