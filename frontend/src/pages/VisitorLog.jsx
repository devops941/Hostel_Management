import { useState, useEffect } from 'react';
import EmptyState from '../components/EmptyState';
import { UserPlus, UserRound, Hourglass, Check, X, Send, BookOpen } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function VisitorLog({ token, user, setPageError, setNotice }) {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const isStudent = user.role === 'student';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API_URL}/visitors`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (ok) setVisitors(data);
        else setPageError(data.message || 'Failed to load visitor log.');
      })
      .catch(err => {
        if (!cancelled) setPageError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token, refreshKey, setPageError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPageError('');
    setNotice('');
    const form = e.currentTarget;
    const body = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch(`${API_URL}/visitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit visitor request.');
      
      form.reset();
      setNotice('Visitor request submitted for approval.');
      setRefreshKey(k => k + 1);
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setPageError('');
    setNotice('');
    try {
      const res = await fetch(`${API_URL}/visitors/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status.');
      
      setNotice(`Visitor request marked as ${status}.`);
      setRefreshKey(k => k + 1);
    } catch (error) {
      setPageError(error.message);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Approved') return 'text-emerald-700 bg-emerald-50';
    if (status === 'Rejected') return 'text-rose-700 bg-rose-50';
    return 'text-amber-700 bg-amber-50';
  };

  return (
    <section className={`grid gap-6 items-start ${isStudent ? 'xl:grid-cols-[1fr_380px]' : ''}`}>
      <div className="flex flex-col border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
        <div className="flex items-end justify-between gap-4 p-5 sm:p-6 border-b border-slate-200">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">GUEST MANAGEMENT</p>
            <h2 className="text-lg font-bold text-slate-900 leading-tight m-0 flex items-center gap-3">
              {isStudent ? 'My Visitors' : 'Visitor Log'}
              <span className="inline-grid min-w-[28px] h-5 place-items-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600 px-2">{visitors.length}</span>
            </h2>
          </div>
        </div>
        
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm">Loading visitor records...</div>
        ) : visitors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">VISITOR NAME</th>
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">RELATION</th>
                  {!isStudent && <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">STUDENT</th>}
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">DATE OF VISIT</th>
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">STATUS</th>
                  {!isStudent && <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-14"><span className="sr-only">Actions</span></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visitors.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 sm:px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex w-8 h-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shadow-sm">
                          <UserRound className="w-4 h-4" />
                        </div>
                        <strong className="block text-xs font-semibold text-slate-800">{v.visitorName}</strong>
                      </div>
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 text-xs text-slate-600">
                      {v.relation}
                    </td>
                    {!isStudent && (
                      <td className="px-5 sm:px-6 py-3.5">
                        <strong className="block text-xs font-semibold text-slate-800">{v.student?.name || 'Unknown'}</strong>
                      </td>
                    )}
                    <td className="px-5 sm:px-6 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                      {new Date(v.visitDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(v.status)}`}>
                        {v.status === 'Pending' && <Hourglass className="w-3 h-3 mr-1" />}
                        {v.status === 'Approved' && <Check className="w-3 h-3 mr-1" />}
                        {v.status === 'Rejected' && <X className="w-3 h-3 mr-1" />}
                        {v.status}
                      </span>
                    </td>
                    {!isStudent && (
                      <td className="px-5 sm:px-6 py-3.5 text-right whitespace-nowrap">
                        {v.status === 'Pending' ? (
                          <div className="flex gap-2 justify-end">
                            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded" onClick={() => handleUpdateStatus(v._id, 'Approved')}>Approve</button>
                            <button className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded" onClick={() => handleUpdateStatus(v._id, 'Rejected')}>Reject</button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={BookOpen} title="No visitor records" text="There are no visitor requests recorded at this time." />
        )}
      </div>
      
      {isStudent && (
        <form className="flex flex-col p-5 sm:p-6 border border-slate-200 rounded-lg bg-slate-50/50 shadow-sm" onSubmit={handleSubmit}>
          <div className="mb-6">
            <span className="flex w-10 h-10 items-center justify-center rounded-lg text-indigo-700 bg-indigo-100 mb-4 shadow-[inset_0_0_0_1px_rgba(67,56,202,0.1)]">
              <UserPlus className="w-5 h-5" />
            </span>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">GUEST ENTRY</p>
            <h2 className="text-lg font-bold text-slate-900 leading-tight m-0 mb-1">Request Visitor Pass</h2>
            <p className="text-xs text-slate-500 m-0">Pre-register your guests for campus entry.</p>
          </div>
          
          <div className="grid gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-700">Visitor Full Name</span>
              <input className="h-9 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" name="visitorName" required placeholder="e.g. John Doe" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-700">Relation (e.g., Parent, Friend)</span>
              <input className="h-9 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" name="relation" required placeholder="e.g. Father" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-700">Date of Visit</span>
              <input className="h-9 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" name="visitDate" type="date" required />
            </label>
            
            <button className="flex items-center justify-center gap-2 h-10 mt-2 px-4 rounded-md font-semibold text-[13px] text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm" type="submit">
              <Send className="w-4 h-4" />
              Submit Request
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
