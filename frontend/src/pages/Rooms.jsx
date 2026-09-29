import React, { useState } from 'react'
import EmptyState from '../components/EmptyState'
import { DoorOpen, Trash2, Plus, AlertTriangle } from 'lucide-react'

export default function Rooms({ isAdmin, rooms, user, fetchRooms, setPageError, setNotice }) {
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });

  const handleCreateRoom = async (e) => {
    e.preventDefault()
    setPageError('')
    setNotice('')
    
    const formData = new FormData(e.target)
    const newRoom = {
      roomNumber: formData.get('roomNumber'),
      building: formData.get('building'),
      floor: Number(formData.get('floor')),
      capacity: Number(formData.get('capacity')),
    }
    
    try {
      const res = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newRoom)
      })
      if (res.ok) {
        setNotice('Room created successfully')
        e.target.reset()
        fetchRooms()
      } else {
        const data = await res.json()
        setPageError(data.message || 'Failed to create room')
      }
    } catch (err) {
      setPageError('Server connection failed')
    }
  }

  const confirmDelete = (roomId) => {
    setConfirmDialog({ isOpen: true, id: roomId });
  }

  const handleDelete = async () => {
    const roomId = confirmDialog.id;
    setConfirmDialog({ isOpen: false, id: null });
    
    setPageError('')
    setNotice('')
    
    try {
      const res = await fetch(`${API_URL}/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      if (res.ok) {
        setNotice('Room deleted successfully')
        fetchRooms()
      } else {
        const data = await res.json()
        setPageError(data.message || 'Failed to delete room')
      }
    } catch (err) {
      setPageError('Server connection failed')
    }
  }

  return (
    <section className={`grid gap-6 items-start ${isAdmin ? 'xl:grid-cols-[1fr_380px]' : ''}`}>
      <div className="flex flex-col border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
        <div className="flex items-end justify-between gap-4 p-5 sm:p-6 border-b border-slate-200">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">ROOM INVENTORY</p>
            <h2 className="text-lg font-bold text-slate-900 leading-tight m-0 flex items-center gap-3">
              All rooms 
              <span className="inline-grid min-w-[28px] h-5 place-items-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600 px-2">{rooms.length}</span>
            </h2>
          </div>
          <span className="text-xs text-slate-500">{rooms.reduce((total, room) => total + room.available, 0)} beds available</span>
        </div>
        
        {rooms.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">ROOM</th>
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">BUILDING</th>
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">FLOOR</th>
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">OCCUPANCY</th>
                  <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">STATUS</th>
                  {isAdmin && <th className="px-5 sm:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-14"><span className="sr-only">Actions</span></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 sm:px-6 py-3.5"><strong className="text-xs font-semibold text-slate-800 tabular-nums">{room.roomNumber}</strong></td>
                    <td className="px-5 sm:px-6 py-3.5 text-xs text-slate-600">{room.building}</td>
                    <td className="px-5 sm:px-6 py-3.5 text-xs text-slate-600">{room.floor}</td>
                    <td className="px-5 sm:px-6 py-3.5">
                      <div className="flex items-center gap-3 w-full max-w-[120px]">
                        <span className="text-[11px] font-medium text-slate-700 min-w-[32px]">{room.occupied} / {room.capacity}</span>
                        <span className="relative flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <i className="absolute top-0 left-0 h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, room.occupied / room.capacity * 100)}%` }} />
                        </span>
                      </div>
                    </td>
                    <td className="px-5 sm:px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${room.available ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 bg-slate-100'}`}>
                        <i className={`w-1.5 h-1.5 rounded-full ${room.available ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {room.available ? `${room.available} available` : 'Full'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-5 sm:px-6 py-3.5 text-right">
                        <button type="button" className="grid w-7 h-7 place-items-center rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors text-sm" title="Delete room" aria-label={`Delete room ${room.roomNumber}`} onClick={() => confirmDelete(room._id)}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon="door-open" title="No rooms in the inventory" text={isAdmin ? 'Add a room to start tracking hostel capacity.' : 'Your administrator has not added rooms yet.'} />
        )}
      </div>
      
      {isAdmin && (
        <form className="flex flex-col p-5 sm:p-6 border border-slate-200 rounded-lg bg-slate-50/50 shadow-sm" onSubmit={handleCreateRoom}>
          <div className="mb-6">
            <span className="grid w-10 h-10 place-items-center rounded-lg text-indigo-700 bg-indigo-100 mb-4 shadow-[inset_0_0_0_1px_rgba(79,70,229,0.1)]">
              <DoorOpen className="w-5 h-5" />
            </span>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">NEW ROOM</p>
            <h2 className="text-lg font-bold text-slate-900 leading-tight m-0 mb-1">Add a room</h2>
            <p className="text-xs text-slate-500 m-0">Set the room details and total bed capacity.</p>
          </div>
          
          <div className="grid gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-700">Room number</span>
              <input className="h-9 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" name="roomNumber" required placeholder="e.g. A-204" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-700">Building</span>
              <input className="h-9 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" name="building" required placeholder="e.g. North Hall" />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-slate-700">Floor</span>
                <input className="h-9 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" name="floor" type="number" min="0" required defaultValue="0" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-slate-700">Bed capacity</span>
                <input className="h-9 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" name="capacity" type="number" min="1" required defaultValue="4" />
              </label>
            </div>
            
            <button className="flex items-center justify-center gap-2 h-10 mt-4 px-4 rounded-md font-semibold text-[13px] text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm" type="submit">
              <Plus className="w-4 h-4" />
              Add Room
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
              <h3 className="text-lg font-bold text-slate-900">Delete Room</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">Are you sure you want to delete this room? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDialog({ isOpen: false, id: null })} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
