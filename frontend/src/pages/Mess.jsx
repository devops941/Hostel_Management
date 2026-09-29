import { useState, useEffect } from 'react';
import { Utensils, CalendarDays, Edit3, CheckCircle2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Mess({ token, user, setPageError, setNotice }) {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [optOutStatus, setOptOutStatus] = useState(false);
  const [attendingCount, setAttendingCount] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const isStudent = user.role === 'student';
  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    Promise.all([
      fetch(`${API_URL}/mess/menu`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_URL}/mess/optout?date=${todayDate}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ])
    .then(([menuData, optOutData]) => {
      if (cancelled) return;
      if (menuData.message) throw new Error(menuData.message);
      
      setMenu(menuData);
      
      if (isStudent) {
        setOptOutStatus(optOutData.length > 0);
      } else {
        setAttendingCount(optOutData.attendingCount || 0);
        setTotalStudents(optOutData.totalStudents || 0);
      }
    })
    .catch(err => {
      if (!cancelled) setPageError(err.message);
    })
    .finally(() => {
      if (!cancelled) setLoading(false);
    });
    
    return () => { cancelled = true; };
  }, [token, refreshKey, setPageError, isStudent, todayDate]);

  const handleUpdateMenu = async (e, day) => {
    e.preventDefault();
    setPageError('');
    setNotice('');
    const form = e.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    body.day = day;

    try {
      const res = await fetch(`${API_URL}/mess/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setNotice(`Menu updated for ${day}.`);
      setRefreshKey(k => k + 1);
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleToggleOptOut = async () => {
    setPageError('');
    setNotice('');
    try {
      const res = await fetch(`${API_URL}/mess/optout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ date: todayDate })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      if (data.status === 'opted_out') {
        setNotice("You have successfully opted out of today's meals.");
      } else {
        setNotice("You are now opted in for today's meals.");
      }
      setRefreshKey(k => k + 1);
    } catch (error) {
      setPageError(error.message);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500 text-sm">Loading mess data...</div>;

  return (
    <div className="grid gap-6 items-start lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 bg-slate-50/50">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">FOOD MANAGEMENT</p>
            <h2 className="text-lg font-bold text-slate-900 leading-tight m-0 flex items-center gap-2">
              Weekly Menu Plan
            </h2>
          </div>
          <CalendarDays className="w-5 h-5 text-indigo-400" />
        </div>
        
        <div className="divide-y divide-slate-100">
          {DAYS.map(day => {
            const dayMenu = menu.find(m => m.day === day) || { breakfast: '', lunch: '', dinner: '' };
            return (
              <div key={day} className="p-5 sm:p-6 hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">{day}</h3>
                  <div className="h-px bg-slate-200 flex-1 ml-2"></div>
                </div>
                
                {isStudent ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-md border border-slate-200 shadow-sm">
                      <strong className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Breakfast</strong>
                      <span className="text-[13px] font-medium text-slate-700">{dayMenu.breakfast || <span className="text-slate-300 italic">Not set</span>}</span>
                    </div>
                    <div className="bg-white p-3 rounded-md border border-slate-200 shadow-sm">
                      <strong className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Lunch</strong>
                      <span className="text-[13px] font-medium text-slate-700">{dayMenu.lunch || <span className="text-slate-300 italic">Not set</span>}</span>
                    </div>
                    <div className="bg-white p-3 rounded-md border border-slate-200 shadow-sm">
                      <strong className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Dinner</strong>
                      <span className="text-[13px] font-medium text-slate-700">{dayMenu.dinner || <span className="text-slate-300 italic">Not set</span>}</span>
                    </div>
                  </div>
                ) : (
                  <form className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end" onSubmit={(e) => handleUpdateMenu(e, day)}>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Breakfast</span>
                      <input className="h-9 px-3 border border-slate-300 rounded-md bg-white text-[13px] font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" name="breakfast" defaultValue={dayMenu.breakfast} placeholder="Menu items..." />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Lunch</span>
                      <input className="h-9 px-3 border border-slate-300 rounded-md bg-white text-[13px] font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" name="lunch" defaultValue={dayMenu.lunch} placeholder="Menu items..." />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Dinner</span>
                      <input className="h-9 px-3 border border-slate-300 rounded-md bg-white text-[13px] font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" name="dinner" defaultValue={dayMenu.dinner} placeholder="Menu items..." />
                    </label>
                    <div>
                      <button type="submit" className="h-9 px-3 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-md hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                        Save
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <aside className="flex flex-col gap-6">
        <div className="p-6 border border-slate-200 rounded-lg bg-white shadow-sm text-center relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-orange-50 rounded-full blur-xl opacity-60 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-20 h-20 bg-indigo-50 rounded-full blur-xl opacity-60 pointer-events-none"></div>
          
          <div className="relative mb-5">
            <span className="mx-auto w-12 h-12 flex items-center justify-center rounded-xl bg-orange-100 text-orange-600 shadow-[inset_0_0_0_1px_rgba(234,88,12,0.1)] mb-3">
              <Utensils className="w-5 h-5" />
            </span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">METRICS</p>
            <h3 className="text-base font-bold text-slate-900">Today's Attendance</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          </div>
          
          {isStudent ? (
            <div className="relative pt-5 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-600 mb-5 leading-relaxed">
                {optOutStatus 
                  ? "You have opted out of meals for today." 
                  : "You are marked as attending meals today. Help reduce food waste by opting out if you eat outside."}
              </p>
              <button 
                onClick={handleToggleOptOut}
                className={`w-full h-10 flex items-center justify-center gap-2 rounded-md font-bold text-xs transition-colors shadow-sm ${
                  optOutStatus 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20' 
                    : 'bg-white border border-slate-300 text-red-600 hover:bg-red-50 hover:border-red-200'
                }`}
              >
                {optOutStatus ? <><CheckCircle2 className="w-4 h-4" /> Opted out (Click to opt in)</> : "Opt out of today's meals"}
              </button>
            </div>
          ) : (
            <div className="relative pt-5 border-t border-slate-100">
              <div className="text-5xl font-black text-slate-800 mb-2 tracking-tight">{attendingCount}</div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Students Eating Today</p>
              
              <div className="w-full bg-slate-100 h-2.5 rounded-full mt-6 mb-2 overflow-hidden shadow-inner">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${totalStudents ? (attendingCount / totalStudents) * 100 : 0}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center text-[11px] font-semibold">
                <span className="text-emerald-600">{attendingCount} attending</span>
                <span className="text-slate-400">{totalStudents - attendingCount} opted out</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
