import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Rooms from './pages/Rooms'
import Accounts from './pages/Accounts'
import Mess from './pages/Mess'
import GatePass from './pages/GatePass'
import Complaints from './pages/Complaints'
import VisitorLog from './pages/VisitorLog'
import Fees from './pages/Fees'
import Reports from './pages/Reports'
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  Users,
  Ticket,
  Utensils,
  Receipt,
  AlertTriangle,
  BookOpen,
  FileText,
  Power,
  Calendar,
  AlertCircle,
  CheckCircle,
  Construction,
  BarChart3,
  LogOut
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const navigate = useNavigate();
  const location = useLocation();
  const activePage = location.pathname.split('/')[1] || 'dashboard';

  const setActivePage = (page) => {
    navigate(`/${page}`);
  };

  const [rooms, setRooms] = useState([])
  const [students, setStudents] = useState([])
  const [staff, setStaff] = useState([])
  const [pageError, setPageError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (notice || pageError) {
      const timer = setTimeout(() => {
        setNotice('');
        setPageError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notice, pageError]);

  useEffect(() => {
    // If the user object is malformed (e.g., missing token from a previous broken login), log them out
    if (user && !user.token) {
      handleLogout()
      return
    }

    if (user) {
      fetchRooms()
      fetchStudents()
      fetchStaff()
    }
  }, [user])

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_URL}/rooms`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setRooms(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_URL}/users?role=student`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setStudents(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API_URL}/users?role=staff`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setStaff(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogin = async (credentials) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      const data = await res.json()
      if (res.ok) {
        const flattenedUser = { token: data.token, ...data.user }
        setUser(flattenedUser)
        localStorage.setItem('user', JSON.stringify(flattenedUser))
      } else {
        throw new Error(data.message || 'Login failed')
      }
    } catch (err) {
      throw err
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    setActivePage('dashboard')
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  const isAdmin = user?.role === 'admin'

  const dashboardStats = {
    students: students.length,
    staff: staff.length,
    occupiedBeds: rooms.reduce((sum, r) => sum + (r.occupied || 0), 0)
  }

  const getIcon = (id) => {
    switch (id) {
      case 'dashboard': return <LayoutDashboard className="w-5 h-5" />;
      case 'rooms': return <Building2 className="w-5 h-5" />;
      case 'students': return <GraduationCap className="w-5 h-5" />;
      case 'staff': return <Users className="w-5 h-5" />;
      case 'gatepass': return <Ticket className="w-5 h-5" />;
      case 'mess': return <Utensils className="w-5 h-5" />;
      case 'fees': return <Receipt className="w-5 h-5" />;
      case 'complaints': return <AlertTriangle className="w-5 h-5" />;
      case 'visitors': return <BookOpen className="w-5 h-5" />;
      case 'reports': return <BarChart3 className="w-5 h-5" />;
      default: return <LayoutDashboard className="w-5 h-5" />;
    }
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', roles: ['admin', 'staff', 'student'] },
    { id: 'rooms', label: 'Rooms & Blocks', roles: ['admin', 'staff'] },
    { id: 'students', label: 'Student Management ', roles: ['admin', 'staff'] },
    { id: 'staff', label: 'Staff Management ', roles: ['admin'] },
    { id: 'gatepass', label: 'Gate Pass', roles: ['admin', 'staff', 'student'] },
    { id: 'mess', label: 'Mess & Food', roles: ['admin', 'staff', 'student'] },
    { id: 'fees', label: 'Fee & Payment', roles: ['admin', 'student'] },
    { id: 'complaints', label: 'Complaints', roles: ['admin', 'staff', 'student'] },
    { id: 'visitors', label: 'Visitor Log', roles: ['admin', 'staff', 'student'] },
    { id: 'reports', label: 'Reports', roles: ['admin'] },
  ].filter(item => item.roles.includes(user.role))

  const totalBeds = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0)
  const occupancyPercent = totalBeds === 0 ? 0 : Math.round((dashboardStats.occupiedBeds / totalBeds) * 100)

  // Current Date formatting
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="bg-gray-50 flex h-screen font-sans text-gray-800 overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">H</div>
          <span className="text-xl font-bold text-indigo-900">HavenHouse</span>
        </div>

        <div className="p-4 text-xs font-semibold text-gray-400 tracking-wider">WORKSPACE</div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActivePage(item.id); setPageError(''); setNotice(''); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 rounded-r-lg border-l-4 border-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50 rounded-lg border-l-4 border-transparent'}`}
              >
                {getIcon(item.id)}
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm uppercase">
              {user.name?.slice(0, 2)}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold truncate">{user.name}</div>
              <div className="text-xs text-gray-500 capitalize">{user.role} Account</div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex-shrink-0">
              <Power className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500 mb-1 uppercase">HAVENHOUSE / {activePage.replace('-', ' ')}</div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">{navItems.find(i => i.id === activePage)?.label || activePage}</h1>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">System Online</span>
            </div>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {today}
            </span>
          </div>
        </header>

        {/* Dashboard Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {pageError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{pageError}</p>
            </div>
          )}
          {notice && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3">
              <CheckCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{notice}</p>
            </div>
          )}

          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <Overview
                user={user}
                dashboard={dashboardStats}
                rooms={rooms}
                setActivePage={setActivePage}
                isAdmin={isAdmin}
                totalBeds={totalBeds}
                occupancyPercent={occupancyPercent}
              />
            } />
            <Route path="/rooms" element={
              ['admin', 'staff'].includes(user.role) ? 
              <Rooms rooms={rooms} fetchRooms={fetchRooms} user={user} setPageError={setPageError} setNotice={setNotice} isAdmin={isAdmin} /> : 
              <Navigate to="/dashboard" replace />
            } />
            <Route path="/mess" element={
              <Mess user={user} token={user.token} setPageError={setPageError} setNotice={setNotice} />
            } />
            <Route path="/students" element={
              ['admin', 'staff'].includes(user.role) ?
              <Accounts
                activePage="students"
                isAdmin={isAdmin}
                accounts={students}
                rooms={rooms}
                user={user}
                setPageError={setPageError}
                setNotice={setNotice}
                fetchAccounts={fetchStudents}
              /> :
              <Navigate to="/dashboard" replace />
            } />
            <Route path="/staff" element={
              user.role === 'admin' ?
              <Accounts
                activePage="staff"
                isAdmin={isAdmin}
                accounts={staff}
                rooms={rooms}
                user={user}
                setPageError={setPageError}
                setNotice={setNotice}
                fetchAccounts={fetchStaff}
              /> :
              <Navigate to="/dashboard" replace />
            } />
            <Route path="/gatepass" element={
              <GatePass user={user} token={user.token} setPageError={setPageError} setNotice={setNotice} />
            } />
            <Route path="/complaints" element={
              <Complaints user={user} token={user.token} setPageError={setPageError} setNotice={setNotice} />
            } />
            <Route path="/visitors" element={
              <VisitorLog user={user} token={user.token} setPageError={setPageError} setNotice={setNotice} />
            } />
            <Route path="/fees" element={
              ['admin', 'student'].includes(user.role) ?
              <Fees user={user} token={user.token} accounts={students} setPageError={setPageError} setNotice={setNotice} /> :
              <Navigate to="/dashboard" replace />
            } />
            <Route path="/reports" element={
              user.role === 'admin' ?
              <Reports user={user} token={user.token} setPageError={setPageError} setNotice={setNotice} /> :
              <Navigate to="/dashboard" replace />
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}