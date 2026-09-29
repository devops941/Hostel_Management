import { Users, Contact, Building, BedDouble, AlertCircle } from 'lucide-react';

export default function StatCard({ title, value, iconType, tone = 'neutral', subtext, onClick }) {
  const tones = {
    brand: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
    neutral: { bg: 'bg-gray-100', text: 'text-gray-600' },
    success: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    warning: { bg: 'bg-amber-100', text: 'text-amber-600' },
    danger: { bg: 'bg-red-100', text: 'text-red-600' }
  };
  
  const currentTone = tones[tone] || tones.neutral;

  const getIcon = (type) => {
    switch (type) {
      case 'students': return <Users className="w-4 h-4" />;
      case 'staff': return <Contact className="w-4 h-4" />;
      case 'rooms': return <Building className="w-4 h-4" />;
      case 'occupancy': return <BedDouble className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  }

  const CardWrapper = onClick ? 'button' : 'div';

  return (
    <CardWrapper 
      onClick={onClick}
      className={`bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col text-left transition-all ${onClick ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md' : ''}`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">{title}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentTone.bg} ${currentTone.text}`}>
          {getIcon(iconType)}
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value !== undefined ? value : 0}</div>
      <div className="text-sm text-gray-600 mt-1 font-medium">{subtext}</div>
    </CardWrapper>
  )
}
