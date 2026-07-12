import React from 'react';

export default function LoginScreen({ authMode, setAuthMode, authForm, setAuthForm, onSubmit }) {
  const demoUsers = [
    { role: 'Admin', email: 'admin@assetflow.com', password: 'admin123' },
    { role: 'Asset Manager', email: 'manager@assetflow.com', password: 'manager123' },
    { role: 'Department Head', email: 'priya@assetflow.com', password: 'priya123' },
    { role: 'Employee', email: 'employee1@assetflow.com', password: 'emp1' }
  ];

  return (
    <div className="login-shell min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_38%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_32%),linear-gradient(135deg,var(--color-body-bg),#ffffff_45%,var(--color-body-bg))] px-4 py-5 sm:px-6 flex items-center justify-center overflow-x-hidden lg:h-screen lg:overflow-hidden">
      <div className="w-full max-w-[980px] h-full lg:max-h-[calc(100vh-3rem)] grid gap-5 lg:grid-cols-2 items-stretch">
        <section className="bg-card-bg/95 backdrop-blur border border-border-color/80 rounded-[1.75rem] px-6 sm:px-8 py-8 shadow-[0_24px_56px_-30px_rgba(15,23,42,0.35)] flex items-center min-h-0">
          <div className="w-full max-w-[460px] mx-auto flex flex-col justify-center gap-4 sm:gap-[18px]">
            <div className="flex flex-col items-center text-center gap-2.5">
              <div className="w-[68px] h-[68px] rounded-[1.25rem] bg-[linear-gradient(135deg,#43e8b6_0%,#6366f1_100%)] text-white flex items-center justify-center font-extrabold text-3xl shadow-[0_16px_28px_-14px_rgba(99,102,241,0.7)] mb-1">
                AF
              </div>
              <h2 className="text-[2rem] sm:text-[2.15rem] font-extrabold text-text-heading tracking-tight leading-[1.08]">
                {authMode === 'login' ? 'Sign In to AssetFlow' : 'Create AssetFlow Account'}
              </h2>
              <p className="text-[15px] text-text-muted max-w-[320px] leading-6">
                {authMode === 'login' ? 'Access your Enterprise Asset Dashboard' : 'Sign up to register as an organizational employee'}
              </p>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-[18px]">
              {authMode === 'signup' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-heading">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    className="h-[50px] w-full px-4 rounded-xl border border-border-color bg-card-bg text-text-main text-[15px] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 border-solid"
                    value={authForm.name}
                    onChange={e => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-heading">Work Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. admin@assetflow.com"
                  className="h-[50px] w-full px-4 rounded-xl border border-border-color bg-card-bg text-text-main text-[15px] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 border-solid"
                  value={authForm.email}
                  onChange={e => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-heading">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="h-[50px] w-full px-4 rounded-xl border border-border-color bg-card-bg text-text-main text-[15px] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 border-solid"
                  value={authForm.password}
                  onChange={e => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                className="mt-1 h-[50px] w-full bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-[0_12px_24px_-14px_rgba(99,102,241,0.85)] border-none outline-none"
              >
                {authMode === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <div className="text-center text-sm text-text-muted border-t border-border-color/50 pt-4 sm:pt-5">
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
        </section>

        {authMode === 'login' && (
          <section className="bg-card-bg/95 backdrop-blur border border-border-color/80 rounded-[1.75rem] px-6 sm:px-8 py-8 shadow-[0_24px_56px_-30px_rgba(15,23,42,0.35)] flex min-h-0">
            <div className="w-full max-w-[440px] mx-auto flex flex-col gap-4 min-h-0">
              <div>
                <p className="text-[12px] font-extrabold uppercase tracking-[0.34em] text-primary">Demo Access</p>
                <h3 className="mt-2 text-[1.5rem] font-extrabold text-text-heading leading-tight">Use these seeded test users</h3>
                <p className="mt-2 text-[15px] text-text-muted leading-6">
                  These accounts are preloaded in the backend so you can sign in immediately.
                </p>
              </div>

              <div className="minimal-scrollbar flex-1 min-h-0 overflow-y-auto pr-1 pt-1">
                <div className="grid gap-3">
                  {demoUsers.map(user => (
                    <div
                      key={user.email}
                      className="rounded-[16px] border border-border-color/70 bg-white p-[18px] shadow-[0_8px_18px_-16px_rgba(15,23,42,0.45)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[17px] font-extrabold text-text-heading leading-tight">{user.role}</p>
                        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">
                          Test
                        </span>
                      </div>
                      <div className="mt-4 grid gap-2 text-[14px] leading-6 text-text-main">
                        <p>
                          <span className="font-semibold text-text-muted">Email:</span> {user.email}
                        </p>
                        <p>
                          <span className="font-semibold text-text-muted">Password:</span> {user.password}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
