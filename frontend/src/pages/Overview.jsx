import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard'
import { PieChart, Bed, AlertTriangle, FileText, Wrench, DoorOpen, UserPlus, UserCog, Bell, Utensils, Receipt, LogOut } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function Overview({ user, dashboard, rooms, setActivePage, isAdmin, totalBeds, occupancyPercent }) {
  const latestRooms = [...rooms].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 3)
  
  const isStudent = user?.role === 'student';
  const [pendingFees, setPendingFees] = useState(0);
  const [recentActivity, setRecentActivity] = useState({ gatePasses: [], complaints: [], visitors: [] });
  const [attentionStats, setAttentionStats] = useState({ unpaidInvoices: 0, pendingMaintenance: 0 });

  useEffect(() => {
    if (isStudent) {
      // Fetch fees
      fetch(`${API_URL}/fees`, { headers: { Authorization: `Bearer ${user.token}` } })
        .then(res => res.json())
        .then(data => {
           if (!data.message && Array.isArray(data)) {
              const pending = data.reduce((sum, fee) => {
                 const amountPaid = fee.amountPaid || 0;
                 return sum + (fee.totalAmount - amountPaid);
              }, 0);
              setPendingFees(pending);
           }
        })
        .catch(console.error);

      // Fetch recent data
      Promise.all([
        fetch(`${API_URL}/gatepass`, { headers: { Authorization: `Bearer ${user.token}` } }).then(r => r.json()),
        fetch(`${API_URL}/complaints`, { headers: { Authorization: `Bearer ${user.token}` } }).then(r => r.json()),
        fetch(`${API_URL}/visitors`, { headers: { Authorization: `Bearer ${user.token}` } }).then(r => r.json())
      ]).then(([gatePasses, complaints, visitors]) => {
         setRecentActivity({
           gatePasses: Array.isArray(gatePasses) && !gatePasses.message ? gatePasses.reverse().slice(0, 2) : [],
           complaints: Array.isArray(complaints) && !complaints.message ? complaints.reverse().slice(0, 2) : [],
           visitors: Array.isArray(visitors) && !visitors.message ? visitors.reverse().slice(0, 2) : []
         });
      }).catch(console.error);
    } else if (!isStudent) {
      Promise.all([
        fetch(`${API_URL}/fees`, { headers: { Authorization: `Bearer ${user.token}` } }).then(r => r.json()),
        fetch(`${API_URL}/complaints`, { headers: { Authorization: `Bearer ${user.token}` } }).then(r => r.json())
      ]).then(([fees, complaints]) => {
         let unpaidInvoices = 0;
         let pendingMaintenance = 0;
         
         if (Array.isArray(fees) && !fees.message) {
            unpaidInvoices = fees.filter(f => (f.totalAmount - (f.amountPaid || 0)) > 0).length;
         }
         
         if (Array.isArray(complaints) && !complaints.message) {
            pendingMaintenance = complaints.filter(c => c.status === 'Open' || c.status === 'Pending').length;
         }
         
         setAttentionStats({ unpaidInvoices, pendingMaintenance });
      }).catch(console.error);
    }
  }, [isStudent, isAdmin, user.token]);

  if (isStudent) {
    return (
      <div className="flex flex-col w-full">
        <p className="text-gray-500 mb-6 font-medium">Welcome to your dashboard.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col cursor-pointer hover:border-indigo-300 transition-colors group" onClick={() => setActivePage('fees')}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                     <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase">Fee & Payment</h3>
                     <p className="text-[11px] font-medium text-gray-400">Current account standing</p>
                  </div>
                </div>
                
                <div className="mt-auto">
                   {pendingFees > 0 ? (
                     <div>
                       <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-0.5">Pending Amount</p>
                       <p className="text-2xl font-black text-red-600 mb-1">₹{pendingFees.toLocaleString()}</p>
                       <p className="text-xs text-red-500 font-medium">Please clear dues soon.</p>
                     </div>
                   ) : (
                     <div>
                       <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5">Status</p>
                       <p className="text-2xl font-black text-emerald-600 mb-1">Fully Paid</p>
                       <p className="text-xs text-emerald-500 font-medium">No pending dues.</p>
                     </div>
                   )}
                </div>
              </div>
            </div>

            <div className="mt-8">
                <h3 className="text-xs font-bold text-slate-800 tracking-widest uppercase mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    {recentActivity.gatePasses.map(gp => (
                      <div key={gp._id} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-gray-50">
                        <div>
                           <p className="text-xs font-bold text-gray-700 uppercase">Gate Pass</p>
                           <p className="text-[10px] text-gray-500">{new Date(gp.departureDate).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${gp.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : gp.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {gp.status}
                        </span>
                      </div>
                    ))}
                    {recentActivity.complaints.map(c => (
                      <div key={c._id} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-gray-50">
                        <div>
                           <p className="text-xs font-bold text-gray-700 uppercase">Complaint: {c.category}</p>
                           <p className="text-[10px] text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : c.status === 'Open' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                          {c.status}
                        </span>
                      </div>
                    ))}
                    {recentActivity.visitors.map(v => (
                      <div key={v._id} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-gray-50">
                        <div>
                           <p className="text-xs font-bold text-gray-700 uppercase">Visitor: {v.visitorName}</p>
                           <p className="text-[10px] text-gray-500">{new Date(v.visitDate).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${v.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : v.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {v.status}
                        </span>
                      </div>
                    ))}
                    {recentActivity.gatePasses.length === 0 && recentActivity.complaints.length === 0 && recentActivity.visitors.length === 0 && (
                       <p className="text-sm text-gray-400 text-center py-2">No recent activity found.</p>
                    )}
                </div>
            </div>
          </div>
          
          <div className="mt-8 lg:mt-0">
            <h3 className="text-xs font-bold text-slate-800 tracking-widest uppercase mb-4">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-3">
                <button onClick={() => setActivePage('gatepass')} className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-brand-600 hover:bg-brand-50 hover:text-brand-700 transition-all group">
                    <DoorOpen className="w-5 h-5 text-gray-400 group-hover:text-brand-600 mb-2 transition-colors" />
                    <span className="text-[10px] text-center font-bold uppercase text-gray-600 group-hover:text-brand-700">Gate Pass</span>
                </button>
                <button onClick={() => setActivePage('complaints')} className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all group">
                    <AlertTriangle className="w-5 h-5 text-gray-400 group-hover:text-rose-600 mb-2 transition-colors" />
                    <span className="text-[10px] text-center font-bold uppercase text-gray-600 group-hover:text-rose-700">Complaint</span>
                </button>
                <button onClick={() => setActivePage('visitors')} className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all group">
                    <UserPlus className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 mb-2 transition-colors" />
                    <span className="text-[10px] text-center font-bold uppercase text-gray-600 group-hover:text-indigo-700">Visitor Log</span>
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <p className="text-gray-500 mb-6 font-medium">A clear view of your hostel operations.</p>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Students" 
          value={dashboard?.students} 
          iconType="students" 
          tone="brand"
          subtext="Active in system"
          onClick={() => setActivePage('students')}
        />
        <StatCard 
          title="Staff" 
          value={dashboard?.staff} 
          iconType="staff" 
          tone="neutral"
          subtext="Active personnel"
          onClick={() => setActivePage('staff')}
        />
        <StatCard 
          title="Rooms" 
          value={rooms.length} 
          iconType="rooms" 
          tone="neutral"
          subtext="Total inventory"
          onClick={() => setActivePage('rooms')}
        />
        <StatCard 
          title="Occupancy" 
          value={`${occupancyPercent}%`} 
          iconType="occupancy" 
          tone="success"
          subtext={`${dashboard?.occupiedBeds || 0} / ${totalBeds} beds filled`}
          onClick={() => setActivePage('rooms')}
        />
      </div>

      {/* Main Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 space-y-6">
            
          {/* Occupancy Breakdown */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-32 h-32 flex-shrink-0">
              <div className="w-full h-full rounded-full border-8 border-gray-100 flex items-center justify-center">
                  <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{occupancyPercent}%</div>
                      <div className="text-[10px] font-bold text-gray-400 tracking-wider">FILLED</div>
                  </div>
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">Occupancy Breakdown</h3>
                  <button className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors">
                      <PieChart className="w-5 h-5" />
                  </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">Current breakdown of bed utilization across all available rooms.</p>
              <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-600"></span><span className="font-medium text-gray-700">Occupied</span></div>
                      <span className="font-bold">{dashboard?.occupiedBeds || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-200"></span><span className="font-medium text-gray-700">Available</span></div>
                      <span className="font-bold">{totalBeds - (dashboard?.occupiedBeds || 0)}</span>
                  </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900">Room Status Overview</h3>
                <button onClick={() => setActivePage('rooms')} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">View All &rarr;</button>
            </div>
            
            {latestRooms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                {latestRooms.map((room) => (
                  <div key={room._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group" onClick={() => setActivePage('rooms')}>
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-500 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                          <DoorOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{room.roomNumber}</p>
                          <p className="text-[10px] font-semibold text-gray-500 uppercase mt-0.5">{room.building}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${room.available ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' : 'bg-red-50 text-red-700 border border-red-100/50'}`}>
                        {room.available ? 'Available' : 'Full'}
                      </span>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Occupancy</span>
                        <span className="text-xs font-bold text-gray-900">{room.occupied} <span className="text-gray-400 font-medium">/ {room.capacity} beds</span></span>
                      </div>
                      <div className="w-full bg-gray-200/80 h-2 rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full rounded-full transition-all duration-500 ${room.available ? 'bg-indigo-500' : 'bg-red-500'}`} style={{ width: `${(room.occupied / room.capacity) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Bed className="w-6 h-6 text-gray-400" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">No rooms configured</h4>
                  <p className="text-sm text-gray-500 mb-4">You haven't added any rooms to the system yet.</p>
                  <button onClick={() => setActivePage('rooms')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                      Add Your First Room
                  </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Narrower) */}
        <div className="space-y-6">
          <div className="mt-8 lg:mt-0">
              <h3 className="text-xs font-bold text-slate-800 tracking-widest uppercase mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Requires Attention
              </h3>
              <div className="space-y-3">
                  <button onClick={() => setActivePage('fees')} className="w-full text-left bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg hover:bg-red-100 transition-colors flex gap-3">
                      <FileText className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                      <div>
                          <div className="font-bold text-red-900 text-sm">{attentionStats.unpaidInvoices} Unpaid Invoices</div>
                          <div className="text-xs text-red-700 mt-1">Pending payments in system</div>
                      </div>
                  </button>
                  <button onClick={() => setActivePage('complaints')} className="w-full text-left bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg hover:bg-amber-100 transition-colors flex gap-3">
                      <Wrench className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                          <div className="font-bold text-amber-900 text-sm">{attentionStats.pendingMaintenance} Pending Maintenance</div>
                          <div className="text-xs text-amber-700 mt-1">Awaiting staff assignment</div>
                      </div>
                  </button>
              </div>
          </div>

          {/* Quick Actions */}
          {isAdmin && (
            <div className="mt-8">
                <h3 className="text-xs font-bold text-slate-800 tracking-widest uppercase mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setActivePage('rooms')} className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all group">
                        <DoorOpen className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 mb-2 transition-colors" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">Add Room</span>
                    </button>
                    <button onClick={() => setActivePage('students')} className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all group">
                        <UserPlus className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 mb-2 transition-colors" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">Admit</span>
                    </button>
                    <button onClick={() => setActivePage('staff')} className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all group">
                        <UserCog className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 mb-2 transition-colors" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">Hire</span>
                    </button>
                    <button onClick={() => setActivePage('complaints')} className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700 transition-all group">
                        <Bell className="w-6 h-6 text-gray-400 group-hover:text-amber-600 mb-2 transition-colors" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-amber-700">Alerts</span>
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
