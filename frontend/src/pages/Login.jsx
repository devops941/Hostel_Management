import { useState } from 'react'

const roleOptions = [
  { id: 'admin', label: 'Admin', icon: 'fa-user-shield' },
  { id: 'staff', label: 'Staff', icon: 'fa-id-badge' },
  { id: 'student', label: 'Student', icon: 'fa-graduation-cap' },
]

export default function Login({ sessionLoading, onLogin }) {
  const [selectedRole, setSelectedRole] = useState('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [pageError, setPageError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setPageError('')
    setLoginLoading(true)
    try {
      await onLogin({ email, password, role: selectedRole })
    } catch (error) {
      setPageError(error.message)
    } finally {
      setLoginLoading(false)
    }
  }

  if (sessionLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-950 text-indigo-300 text-sm font-medium">
        <span className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mb-4" />
        Restoring your secure session...
      </div>
    )
  }

  return (
    <div className="flex min-h-screen font-sans relative overflow-hidden bg-gradient-to-br from-indigo-950 via-[#1e1b4b] to-slate-950">
      {/* Royal decorative elements */}
      <div className="absolute inset-0 z-0 opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNGRkZGRkYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] mix-blend-overlay" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      
      <div className="relative z-10 flex flex-col flex-1 items-center justify-center p-6 sm:p-12 w-full max-w-7xl mx-auto lg:flex-row lg:justify-between lg:gap-20">
        
        {/* Left side text content */}
        <div className="hidden lg:flex flex-col text-white max-w-lg drop-shadow-lg mb-10 lg:mb-0">
          <div className="flex items-center gap-3 mb-8">
            <span className="grid w-12 h-12 place-items-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-brand-900 text-xl shadow-lg">
              <i className="fa-solid fa-building" aria-hidden="true" />
            </span>
            <span className="text-3xl font-bold tracking-tight">Haven<span className="text-yellow-400">House</span></span>
          </div>
          
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Modern living starts with things running well.
          </h1>
          <p className="text-lg text-indigo-200 leading-relaxed max-w-md font-medium">
            One secure place for room availability, resident accounts, and the people who make a hostel feel like home.
          </p>
        </div>

        {/* Right side glassmorphic form */}
        <div className="w-full max-w-[440px]">
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8 drop-shadow-md">
            <span className="grid w-12 h-12 place-items-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-brand-900 text-xl shadow-lg">
              <i className="fa-solid fa-building" aria-hidden="true" />
            </span>
            <span className="text-3xl font-bold text-white tracking-tight">Haven<span className="text-yellow-400">House</span></span>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-2xl p-8 sm:p-10 relative isolate">
            <div className="absolute inset-0 z-[-1] rounded-2xl bg-gradient-to-b from-white/5 to-transparent" />
            
            <div className="mb-8 text-center">
              <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-2 drop-shadow-sm">WELCOME BACK</p>
              <h2 className="text-2xl font-bold text-white leading-tight mb-2 drop-shadow-md">Sign in to your portal</h2>
              <p className="text-sm text-indigo-200 m-0 drop-shadow-sm">Use the account details provided for your role.</p>
            </div>

            <div className="flex bg-indigo-950/40 rounded-xl p-1 mb-8 shadow-inner border border-white/5" aria-label="Choose account type">
              {roleOptions.map((role) => (
                <button 
                  key={role.id} 
                  type="button" 
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all duration-300 ${selectedRole === role.id ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md transform scale-[1.02]' : 'text-indigo-300 hover:text-white hover:bg-white/5'}`} 
                  onClick={() => { setSelectedRole(role.id); setPageError('') }} 
                  aria-pressed={selectedRole === role.id}
                >
                  <i className={`fa-solid ${role.icon}`} aria-hidden="true" />
                  {role.label}
                </button>
              ))}
            </div>

            {pageError && (
              <div className="flex items-center gap-3 p-4 mb-6 border border-red-500/50 rounded-xl bg-red-500/10 backdrop-blur-md text-red-200 text-xs shadow-lg" role="alert">
                <i className="fa-solid fa-circle-exclamation text-red-400 shrink-0 text-sm" aria-hidden="true" />
                {pageError}
              </div>
            )}

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-indigo-200 drop-shadow-sm uppercase tracking-wider" htmlFor="login-email">Email address</label>
                <div className="relative flex items-center">
                  <i className="absolute left-4 text-indigo-300 fa-regular fa-envelope" aria-hidden="true" />
                  <input 
                    id="login-email" 
                    className="w-full h-12 pl-11 pr-4 border border-white/10 rounded-xl bg-indigo-950/40 backdrop-blur-sm text-sm text-white placeholder:text-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:bg-white/10 transition-all shadow-inner" 
                    type="email" 
                    autoComplete="username" 
                    required 
                    value={email} 
                    onChange={(event) => setEmail(event.target.value)} 
                    placeholder={selectedRole === 'admin' ? 'admin@gmail.com' : 'name@hostel.edu'} 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-indigo-200 drop-shadow-sm uppercase tracking-wider" htmlFor="login-password">Password</label>
                  <span className="text-[9px] text-indigo-300/70 font-medium tracking-wide">Issued by admin</span>
                </div>
                <div className="relative flex items-center">
                  <i className="absolute left-4 text-indigo-300 fa-solid fa-lock" aria-hidden="true" />
                  <input 
                    id="login-password" 
                    className="w-full h-12 pl-11 pr-12 border border-white/10 rounded-xl bg-indigo-950/40 backdrop-blur-sm text-sm text-white placeholder:text-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:bg-white/10 transition-all shadow-inner" 
                    type={showPassword ? 'text' : 'password'} 
                    autoComplete="current-password" 
                    required 
                    value={password} 
                    onChange={(event) => setPassword(event.target.value)} 
                    placeholder="Enter your password" 
                  />
                  <button 
                    className="absolute right-3 grid w-8 h-8 place-items-center rounded-lg text-indigo-300 hover:text-white hover:bg-white/10 transition-colors" 
                    type="button" 
                    onClick={() => setShowPassword((visible) => !visible)} 
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <button 
                className="flex items-center justify-center gap-2 h-12 mt-4 rounded-xl font-bold text-[15px] tracking-wide text-brand-900 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 transition-all shadow-[0_4px_14px_0_rgba(251,191,36,0.39)] hover:shadow-[0_6px_20px_rgba(251,191,36,0.23)] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none" 
                type="submit" 
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <><span className="w-5 h-5 rounded-full border-2 border-brand-900/30 border-t-brand-900 animate-spin" />Signing in...</>
                ) : (
                  <>Sign in <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" /></>
                )}
              </button>
            </form>
          </div>
          
          <p className="flex items-center justify-center gap-2 mt-8 text-xs text-indigo-300/80 drop-shadow-md">
            <i className="fa-solid fa-shield-halved text-brand-400" aria-hidden="true" /> 
            Secure access managed by hostel administration
          </p>
        </div>
      </div>
    </div>
  )
}
