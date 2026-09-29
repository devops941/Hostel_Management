export default function RoomRow({ room }) {
  return (
    <div className="flex min-h-[58px] items-center gap-3 border-b border-slate-100 last:border-0 py-2">
      <span className="grid w-8 h-8 shrink-0 place-items-center rounded-md text-emerald-700 bg-emerald-50 text-[11px]">
        <i className="fa-solid fa-door-closed" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-[11px] text-slate-800">{room.roomNumber}</strong>
        <small className="block truncate text-[9px] text-slate-400 mt-1">{room.building} · Floor {room.floor}</small>
      </span>
      <span className="min-w-[42px] text-right text-[10px] font-bold text-slate-700">
        {room.occupied}
        <span className="text-slate-400 font-medium"> / {room.capacity}</span>
        <small className="block text-[8px] text-slate-400 font-normal mt-0.5">beds</small>
      </span>
      <span className={`min-w-[51px] text-right text-[9px] ${room.available ? 'text-emerald-600' : 'text-red-500'}`}>
        {room.available ? `${room.available} free` : 'Full'}
      </span>
    </div>
  )
}
