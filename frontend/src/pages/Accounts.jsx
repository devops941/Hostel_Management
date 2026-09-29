import { useState, useEffect } from 'react'
import EmptyState from '../components/EmptyState'
import { Trash2, UserPlus, GraduationCap, Users, AlertTriangle, LogOut } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export default function Accounts({ activePage, isAdmin, accounts, rooms, user, setPageError, setNotice, fetchAccounts }) {
  const [feeRecords, setFeeRecords] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });

  const fetchFees = () => {
    fetch(`${API_URL}/fees`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFeeRecords(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (activePage === 'students') {
      fetchFees();
    }
  }, [activePage, accounts, user.token]);

  const handleCreateAccount = async (e) => {
    e.preventDefault()
    setPageError('')
    setNotice('')
    
    const formData = new FormData(e.target)
    const payload = Object.fromEntries(formData.entries())
    payload.role = activePage === 'students' ? 'student' : 'staff'
    
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setNotice('Account created successfully')
        e.target.reset()
        fetchAccounts()
        if (activePage === 'students') {
          fetchFees()
        }
      } else {
        const data = await res.json()
        setPageError(data.message || 'Failed to create account')
      }
    } catch (err) {
      setPageError('Server connection failed')
    }
  }

  const confirmDelete = (accountId) => {
    setConfirmDialog({ isOpen: true, id: accountId });
  }

  const handleDelete = async () => {
    const accountId = confirmDialog.id;
    setConfirmDialog({ isOpen: false, id: null });
    
    setPageError('')
    setNotice('')
    
    try {
      const res = await fetch(`${API_URL}/users/${accountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      if (res.ok) {
        setNotice(isStudents ? 'Student vacated and account deleted successfully' : 'Account deleted successfully')
        fetchAccounts()
      } else {
        const data = await res.json()
        setPageError(data.message || 'Failed to delete account')
      }
    } catch (err) {
      setPageError('Server connection failed')
    }
  }


  const isStudents = activePage === 'students'
  const title = isStudents ? 'Students' : 'Staff'
  const singularTitle = isStudents ? 'student' : 'staff member'
  const Icon = isStudents ? GraduationCap : Users

  return (
    <section className={`grid gap-6 items-start ${(isAdmin || isStudents) ? 'xl:grid-cols-[1fr_380px]' : ''}`}>
      <div className="flex flex-col border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
        <div className="flex items-end justify-between gap-4 p-5 sm:p-6 border-b border-slate-200">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">ACCOUNT DIRECTORY</p>
            <h2 className="text-lg font-bold text-slate-900 leading-tight m-0 flex items-center gap-3">
              {title} 
              <span className="inline-grid min-w-[28px] h-5 place-items-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600 px-2">{accounts.length}</span>
            </h2>
          </div>
          <span className="text-xs text-slate-500">Created by Admin</span>
        </div>
        
        {accounts.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">NAME</th>
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">EMAIL</th>
                  {isStudents && <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">STUDENT ID</th>}
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">PHONE</th>
                  {isStudents && <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">ROOM</th>}
                  {isStudents && <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">TOTAL FEES</th>}
                  {isStudents && <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">PAID FEES</th>}
                  {isStudents && <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">FEE DUE</th>}
                  {(isAdmin || isStudents) && <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-14"><span className="sr-only">Actions</span></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((account) => {
                  const studentFees = feeRecords.filter(f => f.student?.id === account.id || f.student === account.id || f.student?._id === account.id);
                  const total = studentFees.reduce((sum, fee) => sum + (fee.totalAmount || 0), 0);
                  const paid = studentFees.reduce((sum, fee) => sum + (fee.amountPaid || 0), 0);
                  const due = total - paid;
                  
                  return (
                    <tr key={account.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 sm:px-6 py-3.5"><strong className="text-xs font-semibold text-slate-800">{account.name}</strong></td>
                      <td className="px-5 sm:px-6 py-3.5 text-xs text-slate-600">{account.email}</td>
                      {isStudents && <td className="px-5 sm:px-6 py-3.5 text-xs text-slate-600 font-mono">{account.studentId || '-'}</td>}
                      <td className="px-5 sm:px-6 py-3.5 text-xs text-slate-600">{account.phone || '-'}</td>
                      {isStudents && <td className="px-5 sm:px-6 py-3.5 text-xs text-slate-600 font-semibold">{account.room ? account.room.roomNumber : 'Unassigned'}</td>}
                      
                      {isStudents && <td className="px-5 sm:px-6 py-3.5 text-right text-xs text-slate-600">${total.toFixed(2)}</td>}
                      {isStudents && <td className="px-5 sm:px-6 py-3.5 text-right text-xs text-emerald-600 font-medium">${paid.toFixed(2)}</td>}
                      {isStudents && (
                        <td className="px-5 sm:px-6 py-3.5 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${due > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            ${due.toFixed(2)}
                          </span>
                        </td>
                      )}
                      
                      {(isAdmin || isStudents) && (
                        <td className="px-5 sm:px-6 py-3.5 text-right">
                          {(!isStudents || due <= 0) ? (
                            <button type="button" className="grid w-7 h-7 place-items-center rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors text-sm" title={isStudents ? 'Vacate Student & Delete Account' : 'Delete Staff Account'} onClick={() => confirmDelete(account.id)}>
                              {isStudents ? <LogOut className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium italic" title="Clear pending dues to vacate">Pending Dues</span>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={isStudents ? "graduation-cap" : "users"} title={`No ${title.toLowerCase()} found`} text={`Add a ${singularTitle} to the system to get started.`} />
        )}
      </div>
      
      {(isAdmin || isStudents) && (
        <form className="flex flex-col p-5 sm:p-6 border border-slate-200 rounded-lg bg-slate-50/50 shadow-sm" onSubmit={handleCreateAccount}>
          <div className="mb-6">
            <span className="grid w-10 h-10 place-items-center rounded-lg text-indigo-700 bg-indigo-100 mb-4 shadow-[inset_0_0_0_1px_rgba(79,70,229,0.1)]">
              <Icon className="w-5 h-5" />
            </span>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">NEW {singularTitle.toUpperCase()}</p>
            <h2 className="text-lg font-bold text-slate-900 leading-tight m-0 mb-1">Add {singularTitle}</h2>
            <p className="text-xs text-slate-500 m-0">Create a new account for a {singularTitle}.</p>
          </div>
          
          <div className="grid gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-700">Full name</span>
              <input className="h-9 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" name="name" required placeholder="John Doe" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-700">Email address</span>
              <input className="h-9 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" name="email" type="email" required placeholder="john@example.com" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-700">Phone number</span>
              <input className="h-9 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" name="phone" type="tel" placeholder="+1 (555) 000-0000" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-700">Temporary password</span>
              <input className="h-9 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" name="password" type="password" required placeholder="••••••••" />
            </label>
            
            {isStudents && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-700">Student ID</span>
                    <input className="h-9 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" name="studentId" required placeholder="STU-123" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-700">Assign Room</span>
                    <select className="h-9 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" name="roomId">
                      <option value="">No room</option>
                      {rooms.filter(r => r.available > 0).map(r => (
                        <option key={r._id} value={r._id}>{r.roomNumber}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-700">Total Fee ($)</span>
                    <input className="h-9 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" name="totalFee" type="number" min="0" placeholder="0.00" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-700">Initial Payment ($)</span>
                    <input className="h-9 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" name="initialPayment" type="number" min="0" placeholder="0.00" />
                  </label>
                </div>
              </>
            )}
            
            <button className="flex items-center justify-center gap-2 h-10 mt-4 px-4 rounded-md font-semibold text-[13px] text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm" type="submit">
              <UserPlus className="w-4 h-4" />
              Create Account
            </button>
          </div>
        </form>
      )}

      {/* Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm border border-slate-100">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 capitalize">
                {isStudents ? 'Vacate & Delete Student' : 'Delete Staff Member'}
              </h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              {isStudents 
                ? 'Are you sure you want to vacate this student and delete their account? Their room will be emptied and their login credentials will be permanently removed.' 
                : 'Are you sure you want to delete this staff member? This action cannot be undone.'}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDialog({ isOpen: false, id: null })} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">
                {isStudents ? 'Yes, Vacate' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
