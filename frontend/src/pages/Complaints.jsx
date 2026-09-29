import { useState, useEffect } from 'react';
import EmptyState from '../components/EmptyState';
import { TriangleAlert, ClipboardList, Send } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const CATEGORIES = ['Plumbing', 'Electrical', 'Cleaning', 'Internet', 'Other'];

export default function Complaints({ token, user, setPageError, setNotice }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const isStudent = user.role === 'student';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API_URL}/complaints`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (ok) setComplaints(data);
        else setPageError(data.message || 'Failed to load complaints.');
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
      const res = await fetch(`${API_URL}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit complaint.');

      form.reset();
      setNotice('Complaint lodged successfully. We will look into it soon.');
      setRefreshKey(k => k + 1);
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setPageError('');
    setNotice('');
    try {
      const res = await fetch(`${API_URL}/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status.');

      setNotice('Status updated successfully.');
      setRefreshKey(k => k + 1);
    } catch (error) {
      setPageError(error.message);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Resolved') return 'text-emerald-700 bg-emerald-50';
    if (status === 'In Progress') return 'text-amber-700 bg-amber-50';
    return 'text-rose-700 bg-rose-50';
  };

  return (
    <section className={`grid gap-6 items-start ${isStudent ? 'xl:grid-cols-[1fr_380px]' : ''}`}>
      <div className="flex flex-col border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
        <div className="flex items-end justify-between gap-4 p-5 sm:p-6 border-b border-slate-200">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">MAINTENANCE & ISSUES</p>
            <h2 className="text-lg font-bold text-slate-900 leading-tight m-0 flex items-center gap-3">
              {isStudent ? 'My Complaints' : 'All Complaints'}
              <span className="inline-grid min-w-[28px] h-5 place-items-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600 px-2">{complaints.length}</span>
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm">Loading complaints...</div>
        ) : complaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">DETAILS</th>
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">CATEGORY</th>
                  {!isStudent && <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">STUDENT</th>}
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">DATE</th>
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 sm:px-6 py-3.5 max-w-[250px]">
                      <p className="text-xs text-slate-600 truncate" title={c.description}>{c.description}</p>
                    </td>
                    <td className="px-5 sm:px-6 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                        {c.category}
                      </span>
                    </td>
                    {!isStudent && (
                      <td className="px-5 sm:px-6 py-3.5">
                        <strong className="block text-xs font-semibold text-slate-800">{c.student?.name || 'Unknown'}</strong>

                      </td>
                    )}
                    <td className="px-5 sm:px-6 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 text-center">
                      {isStudent ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(c.status)}`}>
                          {c.status}
                        </span>
                      ) : (
                        <select
                          className={`h-7 pl-2 pr-6 rounded text-[10px] font-bold border-0 cursor-pointer appearance-none transition-colors ${getStatusColor(c.status)}`}
                          value={c.status}
                          onChange={(e) => handleUpdateStatus(c._id, e.target.value)}
                          style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.25rem center', backgroundSize: '1em' }}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={ClipboardList} title="No complaints" text="There are no complaints recorded at this time." />
        )}
      </div>

      {isStudent && (
        <form className="flex flex-col p-5 sm:p-6 border border-slate-200 rounded-lg bg-slate-50/50 shadow-sm" onSubmit={handleSubmit}>
          <div className="mb-6">
            <span className="flex w-10 h-10 items-center justify-center rounded-lg text-rose-700 bg-rose-100 mb-4 shadow-[inset_0_0_0_1px_rgba(225,29,72,0.1)]">
              <TriangleAlert className="w-5 h-5" />
            </span>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">SUBMIT REQUEST</p>
            <h2 className="text-lg font-bold text-slate-900 leading-tight m-0 mb-1">Lodge a Complaint</h2>
            <p className="text-xs text-slate-500 m-0">Report an issue to the hostel administration.</p>
          </div>

          <div className="grid gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-700">Category</span>
              <div className="relative">
                <select className="w-full h-9 pl-3 pr-8 border border-slate-300 rounded-md bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm appearance-none cursor-pointer" name="category" required defaultValue="">
                  <option value="" disabled>Select issue type...</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none" />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-700">Description</span>
              <textarea
                className="w-full p-3 border border-slate-300 rounded-md bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm resize-none h-24"
                name="description"
                required
                placeholder="Please describe the issue in detail..."
              />
            </label>

            <button className="flex items-center justify-center gap-2 h-10 mt-2 px-4 rounded-md font-semibold text-[13px] text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm" type="submit">
              <Send className="w-4 h-4" />
              Submit Complaint
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
