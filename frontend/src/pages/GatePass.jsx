import { useState, useEffect } from 'react';
import EmptyState from '../components/EmptyState';
import { Ticket, Send } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function GatePass({ token, user, setPageError, setNotice }) {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const isStudent = user.role === 'student';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API_URL}/gatepass`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (ok) setPasses(data);
        else setPageError(data.message || 'Failed to load gate passes.');
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
      const res = await fetch(`${API_URL}/gatepass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit request.');
      
      form.reset();
      setNotice('Gate pass request submitted successfully.');
      setRefreshKey(k => k + 1);
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setPageError('');
    setNotice('');
    try {
      const res = await fetch(`${API_URL}/gatepass/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status.');
      
      setNotice(`Request ${status.toLowerCase()}.`);
      setRefreshKey(k => k + 1);
    } catch (error) {
      setPageError(error.message);
    }
  };

  return (
    <section className={`grid gap-6 items-start ${isStudent ? 'xl:grid-cols-[1fr_380px]' : ''}`}>
      <div className="flex flex-col border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
        <div className="flex items-end justify-between gap-4 p-5 sm:p-6 border-b border-slate-200">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">GATE PASS LOGS</p>
            <h2 className="text-lg font-bold text-slate-900 leading-tight m-0 flex items-center gap-3">
              {isStudent ? 'Your Requests' : 'All Student Requests'}
              <span className="inline-grid min-w-[28px] h-5 place-items-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600 px-2">{passes.length}</span>
            </h2>
          </div>
        </div>
        
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm">Loading requests...</div>
        ) : passes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  {!isStudent && <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">STUDENT</th>}
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">REASON</th>
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">DEPARTURE</th>
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">RETURN</th>
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">STATUS</th>
                  {!isStudent && <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-14"><span className="sr-only">Actions</span></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {passes.map((pass) => (
                  <tr key={pass._id} className="hover:bg-slate-50/80 transition-colors">
                    {!isStudent && (
                      <td className="px-5 sm:px-6 py-3.5">
                        <strong className="block text-xs font-semibold text-slate-800">{pass.student?.name}</strong>
                        <span className="text-[10px] text-slate-500">{pass.student?.studentId || 'No ID'}</span>
                      </td>
                    )}
                    <td className="px-5 sm:px-6 py-3.5 text-xs text-slate-600 max-w-[200px] truncate" title={pass.reason}>{pass.reason}</td>
                    <td className="px-5 sm:px-6 py-3.5 text-xs text-slate-600">{new Date(pass.departureDate).toLocaleDateString()}</td>
                    <td className="px-5 sm:px-6 py-3.5 text-xs text-slate-600">{new Date(pass.returnDate).toLocaleDateString()}</td>
                    <td className="px-5 sm:px-6 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        pass.status === 'Approved' ? 'text-emerald-700 bg-emerald-50' : 
                        pass.status === 'Rejected' ? 'text-red-700 bg-red-50' : 
                        'text-amber-700 bg-amber-50'
                      }`}>
                        {pass.status}
                      </span>
                    </td>
                    {!isStudent && (
                      <td className="px-5 sm:px-6 py-3.5 text-right whitespace-nowrap">
                        {pass.status === 'Pending' ? (
                          <div className="flex gap-2 justify-end">
                            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded" onClick={() => handleUpdateStatus(pass._id, 'Approved')}>Approve</button>
                            <button className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded" onClick={() => handleUpdateStatus(pass._id, 'Rejected')}>Reject</button>
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
          <EmptyState icon={Ticket} title="No gate passes found" text={isStudent ? 'You have not submitted any gate pass requests yet.' : 'There are no pending gate pass requests.'} />
        )}
      </div>
      
      {isStudent && (
        <form className="flex flex-col p-5 sm:p-6 border border-slate-200 rounded-lg bg-slate-50/50 shadow-sm" onSubmit={handleSubmit}>
          <div className="mb-6">
            <span className="flex w-10 h-10 items-center justify-center rounded-lg text-indigo-700 bg-indigo-100 mb-4 shadow-[inset_0_0_0_1px_rgba(67,56,202,0.1)]">
              <Ticket className="w-5 h-5" />
            </span>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">NEW REQUEST</p>
            <h2 className="text-lg font-bold text-slate-900 leading-tight m-0 mb-1">Apply for Gate Pass</h2>
            <p className="text-xs text-slate-500 m-0">Submit a request to leave the hostel premises.</p>
          </div>
          
          <div className="grid gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-700">Reason for leaving</span>
              <input className="h-9 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm" name="reason" required placeholder="e.g. Going home for the weekend" />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-slate-700">Departure Date</span>
                <input className="h-9 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm" name="departureDate" type="date" required />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-slate-700">Return Date</span>
                <input className="h-9 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm" name="returnDate" type="date" required />
              </label>
            </div>
            
            <button className="flex items-center justify-center gap-2 h-10 mt-2 px-4 rounded-md font-semibold text-[13px] text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm" type="submit">
              <Send className="w-4 h-4" />
              Submit Request
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
