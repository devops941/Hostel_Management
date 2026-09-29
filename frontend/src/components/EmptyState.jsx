import { DoorOpen, AlertCircle, GraduationCap, Users } from 'lucide-react';

export default function EmptyState({ icon, title, text }) {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'door-open': return <DoorOpen className="w-5 h-5" />;
      case 'graduation-cap': return <GraduationCap className="w-5 h-5" />;
      case 'users': return <Users className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[160px] p-6 text-center">
      <span className="grid w-10 h-10 place-items-center mb-3 rounded-lg text-slate-500 bg-slate-50 text-sm">
        {getIcon(icon)}
      </span>
      <strong className="text-xs text-slate-700">{title}</strong>
      <p className="max-w-[270px] mt-2 text-[10px] leading-relaxed text-slate-500">{text}</p>
    </div>
  )
}
