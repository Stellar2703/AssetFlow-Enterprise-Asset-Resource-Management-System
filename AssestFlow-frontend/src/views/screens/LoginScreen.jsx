import React from 'react';

export default function LoginScreen({ authMode, setAuthMode, authForm, setAuthForm, onSubmit }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-body-bg via-body-bg to-primary/10 p-6">
      <div className="w-full max-w-[440px] bg-card-bg border border-border-color rounded-3xl p-10 shadow-xl flex flex-col gap-6 text-left transition-all duration-300">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-extrabold text-2xl shadow-md mb-2">
            AF
          </div>
          <h2 className="text-2xl font-bold text-text-heading tracking-tight leading-snug">
            {authMode === 'login' ? 'Sign In to AssetFlow' : 'Create AssetFlow Account'}
          </h2>
          <p className="text-sm text-text-muted max-w-[300px]">
            {authMode === 'login' ? 'Access your Enterprise Asset Dashboard' : 'Sign up to register as an organizational employee'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {authMode === 'signup' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-text-heading">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                className="w-full px-4 py-2.5 rounded-xl border border-border-color bg-card-bg text-text-main text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 border-solid"
                value={authForm.name}
                onChange={e => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-heading">Work Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. admin@assetflow.com"
              className="w-full px-4 py-2.5 rounded-xl border border-border-color bg-card-bg text-text-main text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 border-solid"
              value={authForm.email}
              onChange={e => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-heading">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-border-color bg-card-bg text-text-main text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 border-solid"
              value={authForm.password}
              onChange={e => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-md shadow-primary/25 border-none mt-2 outline-none"
          >
            {authMode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center text-sm text-text-muted mt-2 border-t border-border-color/50 pt-4">
          {authMode === 'login' ? (
            <p>
              New Employee?{' '}
              <button 
                className="text-primary hover:text-primary-hover font-bold bg-transparent border-none cursor-pointer p-0 ml-1 inline-block" 
                onClick={() => setAuthMode('signup')}
              >
                Create account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button 
                className="text-primary hover:text-primary-hover font-bold bg-transparent border-none cursor-pointer p-0 ml-1 inline-block" 
                onClick={() => setAuthMode('login')}
              >
                Sign in instead
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
