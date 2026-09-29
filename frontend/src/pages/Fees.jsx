import { useState, useEffect } from 'react';
import EmptyState from '../components/EmptyState';
import { Receipt } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function Fees({ token, user, accounts, setPageError, setNotice }) {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const isStudent = user.role === 'student';

  // For Admin update fee form
  // For Admin update fee form
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [dueAmount, setDueAmount] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedFeeId, setSelectedFeeId] = useState(null);

  // For Admin payment modal
  const [paymentModal, setPaymentModal] = useState(null); // { id, title, due }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API_URL}/fees`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (ok) setFees(data);
        else setPageError(data.message || 'Failed to load fee records.');
      })
      .catch(err => {
        if (!cancelled) setPageError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token, refreshKey, setPageError]);

  const handleUpdateFee = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setPageError('Please select a student.');
      return;
    }
    setPageError('');
    setNotice('');

    try {
      if (selectedFeeId) {
        // Log payment for existing fee
        const res = await fetch(`${API_URL}/fees/${selectedFeeId}/pay`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ amount: paymentAmount })
        });
        if (!res.ok) throw new Error((await res.json()).message || 'Failed to log payment.');
        setNotice(`Payment of ₹${paymentAmount} logged successfully.`);

        setPaymentAmount('');
      }

      setRefreshKey(k => k + 1);
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudentId(studentId);

    if (studentId) {
      const existingFee = fees.find(f => f.student?._id === studentId || f.student?.id === studentId || f.student === studentId);
      if (existingFee) {
        setSelectedFeeId(existingFee._id);
        setDueAmount(existingFee.totalAmount - existingFee.amountPaid);
        setPaymentAmount('');
      } else {
        setSelectedFeeId(null);
        setDueAmount('');
        setPaymentAmount('');
      }
    } else {
      setSelectedFeeId(null);
      setDueAmount('');
      setPaymentAmount('');
    }
  };

  const handleLogPayment = async (e) => {
    e.preventDefault();
    if (!paymentModal) return;
    setPageError('');
    setNotice('');

    const form = e.currentTarget;
    const { amount } = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch(`${API_URL}/fees/${paymentModal.id}/pay`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to log payment.');

      setNotice(`Payment of ₹${amount} logged successfully.`);
      setPaymentModal(null);
      setRefreshKey(k => k + 1);
    } catch (error) {
      setPageError(error.message);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Paid') return 'text-emerald-700 bg-emerald-50';
    if (status === 'Partial') return 'text-amber-700 bg-amber-50';
    return 'text-red-700 bg-red-50';
  };

  return (
    <section className={`grid gap-6 items-start ${!isStudent ? 'xl:grid-cols-[1fr_380px]' : ''}`}>
      <div className="flex flex-col border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
        <div className="flex items-end justify-between gap-4 p-5 sm:p-6 border-b border-slate-200">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">FINANCE</p>
            <h2 className="text-lg font-bold text-slate-900 leading-tight m-0 flex items-center gap-3">
              {isStudent ? 'My Fee Dues' : 'All Fee Records'}
              <span className="inline-grid min-w-[28px] h-5 place-items-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600 px-2">{fees.length}</span>
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm">Loading fee records...</div>
        ) : fees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  {!isStudent && <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">STUDENT</th>}
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">FEE DETAILS</th>
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">TOTAL</th>
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">PAID</th>
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">DUE</th>
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">STATUS</th>
                  {!isStudent && <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-14"><span className="sr-only">Actions</span></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fees.map((fee) => {
                  const balance = fee.totalAmount - fee.amountPaid;
                  return (
                    <tr key={fee._id} className="hover:bg-slate-50/80 transition-colors">
                      {!isStudent && (
                        <td className="px-5 sm:px-6 py-3.5">
                          <strong className="block text-xs font-semibold text-slate-800">{fee.student?.name || 'Unknown'}</strong>
                          <span className="text-[10px] text-slate-500">{fee.student?.studentId || 'No ID'}</span>
                        </td>
                      )}
                      <td className="px-5 sm:px-6 py-3.5">
                        <strong className="block text-xs font-semibold text-slate-800">{fee.title}</strong>
                        <span className="text-[10px] text-slate-500">Due: {new Date(fee.dueDate).toLocaleDateString()}</span>
                      </td>
                      <td className="px-5 sm:px-6 py-3.5 text-xs font-medium text-slate-600 text-right">₹{fee.totalAmount.toLocaleString()}</td>
                      <td className="px-5 sm:px-6 py-3.5 text-xs font-bold text-emerald-600 text-right">₹{fee.amountPaid.toLocaleString()}</td>
                      <td className="px-5 sm:px-6 py-3.5 text-xs font-bold text-red-600 text-right">₹{balance.toLocaleString()}</td>
                      <td className="px-5 sm:px-6 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(fee.status)}`}>
                          {fee.status}
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon="fa-wallet" title="No fee records" text="There are no fee records at this time." />
        )}
      </div>

      {!isStudent && (
        <div className="flex flex-col gap-6">
          <form className="flex flex-col p-5 sm:p-6 border border-slate-200 rounded-lg bg-slate-50/50 shadow-sm" onSubmit={handleUpdateFee}>
            <div className="mb-6">
              <span className="grid w-10 h-10 place-items-center rounded-lg text-indigo-700 bg-indigo-100 mb-4 shadow-[inset_0_0_0_1px_rgba(67,56,202,0.1)]">
                <Receipt className="w-5 h-5" />
              </span>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">ADMIN TOOL</p>
              <h2 className="text-lg font-bold text-slate-900 leading-tight m-0 mb-1">Log Payment</h2>
              <p className="text-xs text-slate-500 m-0">Log a new payment for a pending fee.</p>
            </div>

            <div className="grid gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-slate-700">Student</span>
                <select
                  className="h-9 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  value={selectedStudentId}
                  onChange={handleStudentChange}
                  required
                >
                  <option value="">Select a student...</option>
                  {(accounts || [])
                    .filter(a => a.role === 'student')
                    .filter(s => {
                      const sFee = fees.find(f => f.student?._id === s.id || f.student?.id === s.id || f.student === s.id);
                      if (!sFee) return false;
                      return (sFee.totalAmount - sFee.amountPaid) > 0;
                    })
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.studentId || 'No ID'})</option>
                    ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-700">Due Amount (₹)</span>
                  <input
                    className="h-9 px-3 border border-slate-300 rounded-md bg-slate-100 text-sm text-slate-500 cursor-not-allowed shadow-sm"
                    type="number"
                    disabled
                    value={dueAmount}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-700">Payment Amount (₹)</span>
                  <input
                    className="h-9 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                    type="number"
                    min="1"
                    max={dueAmount || undefined}
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount..."
                  />
                </label>
              </div>

              <button className="flex items-center justify-center gap-2 h-10 mt-2 px-4 rounded-md font-semibold text-[13px] text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm" type="submit" disabled={!selectedFeeId || !dueAmount}>
                <i className="fa-solid fa-save text-xs" aria-hidden="true" />
                Log Payment
              </button>
            </div>
          </form>

          {/* Payment Modal / Inline form for logging payments */}
          {paymentModal && (
            <div className="p-5 sm:p-6 border border-emerald-200 rounded-lg bg-emerald-50/50 shadow-sm relative">
              <button
                type="button"
                className="absolute top-4 right-4 w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                onClick={() => setPaymentModal(null)}
              >
                <i className="fa-solid fa-xmark text-xs" />
              </button>

              <h3 className="text-sm font-bold text-emerald-900 mb-1">Log Payment</h3>
              <p className="text-xs text-emerald-700 mb-4">{paymentModal.title} (Balance: ₹{paymentModal.due})</p>

              <form onSubmit={handleLogPayment} className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    name="amount"
                    max={paymentModal.due}
                    min="1"
                    required
                    defaultValue={paymentModal.due}
                    className="w-full h-9 pl-7 pr-3 border border-emerald-300 rounded-md text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
                  />
                </div>
                <button type="submit" className="h-9 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors whitespace-nowrap shadow-sm">
                  Save
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
